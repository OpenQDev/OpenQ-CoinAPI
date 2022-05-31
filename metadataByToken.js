const polygonMainnetTokenMetadata = require('./constants/openq-polygon-mainnet-indexable.json');
const mumbaiTokenMetadata = require('./constants/openq-polygon-mumbai-indexable.json');
const localTokenMetadata = require('./constants/openq-local-indexable.json');
const ethers = require('ethers');

const cachedMetadataByToken = require('./utils/cachedMetadataByToken');
const fetchMetadata = require('./utils/fetchMetadata');

const metadata = async (client, address) => {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const checkSummedAddress = ethers.utils.getAddress(address);
			let metadata = await cachedMetadataByToken(client, checkSummedAddress);
			if (!metadata) {
				const fetchedMetadata = await fetchMetadata(client);
				fetchedMetadata.forEach(async token => {
					await client.hmset(
						'tokenObject',
						token.address,
						JSON.stringify(token)
					);
				});
				metadata = fetchedMetadata.find(
					tokenData => tokenData.address === address.toLowerCase()
				);
			}
			if (!metadata) {
				switch (process.env.DEPLOY_ENV) {
					case 'polygon-mainnet':
						metadata = polygonMainnetTokenMetadata[checkSummedAddress];
						break;
					case 'mumbai':
						metadata = mumbaiTokenMetadata[checkSummedAddress];
						break;

					case 'local':
						metadata = localTokenMetadata[checkSummedAddress];
				}
			}
			if (!metadata) {
				metadata = {
					chainId: 137,
					name: 'Custom Token',
					symbol: 'CUSTOM',
					decimals: 18,
					address: checkSummedAddress,
					path: '/crypto-logos/ERC20.svg'
				};
			}
			const tokenMetadata = {
				[checkSummedAddress]: {
					...metadata,
					address: ethers.utils.getAddress(metadata.address)
				}
			};
			resolve(tokenMetadata);
		} catch (err) {
			console.log(err);
			reject(err);
		}
	});
	return promise;
};
module.exports = metadata;
