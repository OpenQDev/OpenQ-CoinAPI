const fetchCachedToken = require('./utils/fetchCachedToken.js');
const fetchCoinGeckoPrices = require('./utils/fetchCoinGeckoPrices.js');
const tallyTvl = require('./utils/tallyTvl');

const main = (client, req) => {
	return new Promise(async (resolve, reject) => {
		try {
			const tokenVolumesRaw = req.body.tokenVolumes;
			var key, keys = Object.keys(tokenVolumesRaw);
			var n = keys.length;
			var tokenVolumes = {};
			while (n--) {
				key = keys[n];
				tokenVolumes[key.toLocaleLowerCase()] = tokenVolumesRaw[key];
			}

			if (Object.keys(tokenVolumes).length == 0) {
				return reject({ error: 'missing tokens' });
			}

			const tokenAddresses = Object.keys(tokenVolumes);
			console.log(tokenVolumesRaw);
			console.log(tokenAddresses);

			if (!Array.isArray(tokenAddresses) || tokenAddresses.length === 0) {
				return reject({ error: 'token must not be empty' });
			}

			// Fetch any token price you can from cache
			let remainingTokens = [];
			let cachedTokenPrices = {};
			await Promise.all(
				tokenAddresses.map(async (tokenAddress) => {
					const price = await fetchCachedToken(client, tokenAddress);

					// price will be null if there's an error or cache miss
					if (price != null) {
						cachedTokenPrices[tokenAddress] = {};
						// For later merging with fetched token prices, we must reflect CoinGeckos return object
						cachedTokenPrices[tokenAddress]['usd'] = price;
					} else {
						remainingTokens.push(tokenAddress);
					}
				})
			);

			console.log(remainingTokens);

			// For the remaining tokens which were not in cache, fetch them all with a single call
			const fetchedTokenPrices = await fetchCoinGeckoPrices(
				client,
				remainingTokens
			);
			console.log(fetchedTokenPrices);

			// Merge the cached and fetched token prices into a single object
			const tokenPriceMap = Object.assign(cachedTokenPrices, fetchedTokenPrices);
			console.log(tokenPriceMap);

			// Now multiply each token's USD value by the volume of that token
			let usdValuePerCoin = {};
			let individualTokenPrices = {};
			for (const [key, value] of Object.entries(tokenPriceMap)) {
				const multiplier = tokenVolumes[key] / Math.pow(10, 18);
				usdValuePerCoin[key] = value.usd * multiplier;
				individualTokenPrices[key] = Math.round(parseFloat(value.usd) * 100) / 100;
			}

			// Prepare the result object for return
			let result = {};
			result['tokenPrices'] = individualTokenPrices;
			result['tokens'] = usdValuePerCoin;

			// Throw in the total while we're at it...
			result['total'] = tallyTvl(usdValuePerCoin);

			return resolve(result);
		} catch (error) {
			return reject(error);
		}
	});
};

module.exports = main;