const express = require('express');
const redis = require('redis');
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();

const redisPort = 6379;
const client = redis.createClient(redisPort, process.env.REDIS_URL);
const fetchCachedToken = require('./utils/fetchCachedToken.js');
const fetchCoinGeckoPrices = require('./utils/fetchCoinGeckoPrices.js');
const tallyTvl = require('./utils/tallyTvl');

client.on('error', (err) => {
	console.log(err);
});

const PORT = 8081;
const app = express();

app.use(express.json());
/* Get individual token price
	TODO add error cases like in TVL if this API endpoint is going to be used
*/

app.use(cors({ origin: process.env.ORIGIN_URL }));

app.get('/', (req, res) => {
	const token = req.query.token;
	try {
		client.get(token, async (err, price) => {
			if (err) throw err;

			if (price) {
				res.status(200).send({
					price,
					message: 'data retrieved from the cache',
				});
			} else {
				const result = await axios.get(
					`https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`
				);
				const coinPrice = result.data[token]['usd'];
				client.setex(token, 600, coinPrice);
				res.status(200).send({
					price: coinPrice.toString(),
					message: 'cache miss',
				});
			}
		});
	} catch (err) {
		res.status(500).send({ message: err.message });
	}
});

app.get('/ids', async (req, res) => {
	const url = 'https://api.coingecko.com/api/v3/coins/list';
	const { data } = await axios.get(url);
	res.json(data);
});

app.post('/cache', async (req, res) => {
	const token = req.query.token;
	client.setex(token, 600, 1234);
	res.send(`Set ${token} to price of 1234`);
});

app.get('/cache', async (req, res) => {
	const token = req.query.token;
	await client.get(token, (err, price) => {
		res.json(price);
	});
});

// This only ever makes at most 1 CoinGecko request
app.post('/tvl', async (req, res) => {
	try {
		// Map of token to balances like {"ethereum": 0.4, "bitcoin": "0.003"}
		const tokenVolumesRaw = req.body.tokenVolumes;

		var key, keys = Object.keys(tokenVolumesRaw);
		var n = keys.length;
		var tokenVolumes = {};
		while (n--) {
			key = keys[n];
			tokenVolumes[key.toLocaleLowerCase()] = tokenVolumesRaw[key];
		}

		if (Object.keys(tokenVolumes).length == 0) {
			return res.status(403).json({ error: 'missing tokens' });
		}

		const tokenAddresses = Object.keys(tokenVolumes);

		if (!Array.isArray(tokenAddresses) || tokenAddresses.length === 0) {
			return res.status(403).json({ error: 'token must not be empty' });
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

		// For the remaining tokens which were not in cache, fetch them all with a single call
		const fetchedTokenPrices = await fetchCoinGeckoPrices(
			client,
			remainingTokens
		);

		// Merge the cached and fetched token prices into a single object
		const tokenPriceMap = Object.assign(cachedTokenPrices, fetchedTokenPrices);

		// Now multiply each token's USD value by the volume of that token
		let usdValuePerCoin = {};
		for (const [key, value] of Object.entries(tokenPriceMap)) {
			const multiplier = tokenVolumes[key] / Math.pow(10, 18);
			usdValuePerCoin[key] = value.usd * multiplier;
		}

		// Prepare the result object for return
		let result = {};
		result['tokens'] = usdValuePerCoin;

		// Throw in the total while we're at it...
		result['total'] = tallyTvl(usdValuePerCoin);

		return res.json(result);
	} catch (error) {
		return res.send(error);
	}
});

app.listen(PORT);

console.log(`Listening on ${PORT}`);
