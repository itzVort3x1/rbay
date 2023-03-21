export const pageCacheKey: (id: string) => string = (id: string): string => {
	return `pagecache#${id}`;
};
