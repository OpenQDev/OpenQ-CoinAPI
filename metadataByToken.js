const fetchCachedToken = require('./utils/fetchCachedMetadata');
const fetchMetadata = require('./utils/fetchMetadata');

const metadata = async (client, address) => {
	const promise = new Promise(async (resolve, reject) => {
		let tokenMetadata;
		cachedMetadata = await fetchCachedToken(client, address);
		if (!tokenMetadata) {
			console.log('cache miss');
			const fetchedMetadata = await fetchMetadata(client);
			tokenMetadata = {[address]: fetchedMetadata.find(tokenData=>tokenData.address === address)};	
		}
		resolve(tokenMetadata);
	});
	return promise;
};
module.exports = metadata;
