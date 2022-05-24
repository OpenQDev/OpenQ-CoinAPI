async function fetchCachedMetadata(client, cursor, limit) {
	const cachedMetadata = new Promise((resolve,) => {
		 client.zrange(
			'tokenList',
			cursor,
			cursor + limit - 1,
			(err, data) => {
				resolve(data);
			});
	});
	return cachedMetadata;
}

module.exports = fetchCachedMetadata;