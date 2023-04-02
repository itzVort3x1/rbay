import { SchemaFieldTypes } from 'redis';
import { client } from '$services/redis';
import { itemsIndexKey, itemsKey } from '$services/keys';

export const createIndexes = async () => {
	client.ft.create(
		itemsIndexKey(),
		{
			name: {
				type: SchemaFieldTypes.TEXT
			},
			description: {
				type: SchemaFieldTypes.TEXT
			}
		},
		{
			ON: 'HASH',
			PREFIX: itemsKey('')
		}
	);
};
