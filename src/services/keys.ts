export const pageCacheKey: (id: string) => string = (id: string): string => {
	return `pagecache#${id}`;
};

export const usersKey = (userId: string) => {
	return `users#${userId}`;
};

export const sessionsKey = (sessionId: string) => {
	return `sessions#${sessionId}`;
};

export const usernamesUniqueKey = () => {
	return `usernames:unique`;
};

export const userLikesKey = (userId: string) => {
	return `users:likes#${userId}`;
};

export const usernamesKey = () => {
	return `usernames`;
};

//Items
export const itemsKey = (itemId: string) => {
	return `items#${itemId}`;
};

export const itemsByViewsKey = () => {
	return `items:views`;
};

export const itemsByEndingAtKey = () => {
	return `items:endingAt`;
};

export const itemsViewsKey = (itemId: string) => {
	return `items:views#${itemId}`;
};

export const bidHistoryKey = (itemId: string) => {
	return `history#${itemId}`;
};

export const itemsByPriceKey = () => {
	return `items:price`;
};

export const itemsIndexKey = () => {
	return `idx:items`;
};
