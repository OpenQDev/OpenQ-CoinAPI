const fetchCachedMetadata = require('./utils/fetchCachedMetadata');
const fetchMetadata = require('./utils/fetchMetadata');

const metadata = async (req, client) => {
	const promise = new Promise(async (resolve, reject) => {
		const { query } = req;
		const cursor = parseInt(query.cursor);
		const limit = parseInt(query.limit);
		let tokenMetadata = [];
		cachedMetadata = await fetchCachedMetadata(client, cursor, limit);
		tokenMetadata = cachedMetadata.map(elem=>JSON.parse(elem));
		if (tokenMetadata.length === 0) {
			console.log('cache miss');
			const fetchedMetadata= await fetchMetadata(client, cursor, limit);				
			const paginatedTokens = fetchedMetadata.filter((elem, index) => {
				return index >= cursor && index < limit + cursor;
			});
			tokenMetadata = paginatedTokens;
			console.log(paginatedTokens)			
		}
		console.log(tokenMetadata)
		resolve(tokenMetadata);
	});
	return promise;
};
module.exports = metadata;
