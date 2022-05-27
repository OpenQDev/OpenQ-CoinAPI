// Array of all supported tokens
const polygonMainnetTokens = require('./constants/polygon-mainnet-tokens.json');
const mumbaiTokens = require('./constants/polygon-mumbai-tokens.json');
const localTokens = require('./constants/local-tokens.json');

const fetchCachedMetadata = require('./utils/fetchCachedMetadata');
const fetchMetadata = require('./utils/fetchMetadata');

const metadata = async (req, client) => {
	const promise = new Promise(async (resolve, reject) => {
		const { query } = req;
		const cursor = parseInt(query.cursor);
		const limit = parseInt(query.limit);
		const list = query.list
		if(list === 'polygon'){

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
		}
		resolve(tokenMetadata);
		}
		else if(list === 'constants'){
			switch(process.env.DEPLOY_ENV){
			case 'polygon-mainnet':
				resolve(polygonMainnetTokens)
				break;
			case 'mumbai':
				resolve(mumbaiTokens)
				break;
				case 'local':
				resolve(localTokens)
				break;
			}
		}
		else resolve([])
	});
	return promise;
};
module.exports = metadata;
