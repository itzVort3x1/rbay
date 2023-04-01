import type { CreateBidAttrs, Bid } from '$services/types';
import { bidHistoryKey, itemsKey, itemsByPriceKey } from '$services/keys';
import { client, withLock } from '$services/redis';
import { DateTime } from 'luxon';
import { getItem } from './items';

export const createBid = async (attrs: CreateBidAttrs) => {
	return withLock(attrs.itemId, async (signal: any) => {
		const item = await getItem(attrs.itemId);

		if (!item) {
			throw new Error('Item does not exist');
		}

		if (item.price >= attrs.amount) {
			throw new Error('Bid too low');
		}

		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
			throw new Error('Item has already ended');
		}

		const serialized = serializeHistory(attrs.amount, attrs.createdAt.toMillis());

		if (signal.expired) {
			throw new Error('Lock Expired, cant write any more data');
		}

		return Promise.all([
			client.rPush(bidHistoryKey(attrs.itemId), serialized),
			client.hSet(itemsKey(attrs.itemId), {
				bids: item.bids + 1,
				price: attrs.amount,
				highestBidUserId: attrs.userId
			}),
			client.zAdd(itemsByPriceKey(), {
				value: item.id,
				score: attrs.amount
			})
		]);
	});

	// return client.executeIsolated(async (isolatedClient) => {
	// 	await isolatedClient.watch(itemsKey(attrs.itemId));

	// 	const item = await getItem(attrs.itemId);

	// 	if (!item) {
	// 		throw new Error('Item does not exist');
	// 	}

	// 	if (item.price >= attrs.amount) {
	// 		throw new Error('Bid too low');
	// 	}

	// 	if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
	// 		throw new Error('Item has already ended');
	// 	}

	// 	const serialized = serializeHistory(attrs.amount, attrs.createdAt.toMillis());

	// 	return isolatedClient
	// 		.multi()
	// 		.rPush(bidHistoryKey(attrs.itemId), serialized)
	// 		.hSet(itemsKey(attrs.itemId), {
	// 			bids: item.bids + 1,
	// 			price: attrs.amount,
	// 			highestBidUserId: attrs.userId
	// 		})
	// 		.zAdd(itemsByPriceKey(), {
	// 			value: item.id,
	// 			score: attrs.amount
	// 		})
	// 		.exec();
	// });
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIndex = -1 * offset - count;
	const endIndex = -1 - offset;

	const range = await client.lRange(bidHistoryKey(itemId), startIndex, endIndex);

	return range.map((bid) => deserializeHistory(bid));
};

const serializeHistory = (amount: number, createdAt: number) => {
	return `${amount}:${createdAt}`;
};

const deserializeHistory = (serialized: string) => {
	const [amount, createdAt] = serialized.split(':');
	return { amount: parseFloat(amount), createdAt: DateTime.fromMillis(parseInt(createdAt)) };
};
