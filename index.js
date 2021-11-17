const express = require('express');
const redis = require('redis');
const axios = require('axios');
require('dotenv').config();

const redisPort = 6379;
const client = redis.createClient(redisPort, process.env.REDIS_URL);

client.on('error', (err) => {
	console.log(err);
});

const PORT = 8081;
const app = express();

/* Get individual token price
	TODO add error cases like in TVL if this API endpoint is going to be used
*/

app.get('/', (req, res) => {
	const token = req.query.token;
	console.log('token: ', token);
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

// Get mulitple token prices returned

app.get('/ids', async (req, res) => {
	const url = 'https://api.coingecko.com/api/v3/coins/list';

	const { data } = await axios.get(url);
	res.json(data);
});

app.get('/tvl', async (req, res) => {
	if (!req.query.tokens) {
		res.status(403).json({ error: 'missing tokens' });
		return;
	}

	const tokens = JSON.parse(req.query.tokens);

	if (!Array.isArray(tokens) || tokens.length === 0) {
		res.status(403).json({ error: 'token must not be empty' });
		return;
	}

	const result = await Promise.all(
		tokens.map(async (token) => {
			const cachedPrice = await new Promise((resolve, reject) => {
				client.get(token, (err, price) => {
					if (err) {
						reject(err);
					} else if (price) {
						resolve(price);
					} else {
						console.log(
							// Is this log possible?
							'Go and check the code for this case'
						);
						resolve(null);
					}
				});
			});

			if (cachedPrice) {
				return cachedPrice;
			}

			const url = `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`;
			try {
				const { data } = await axios.get(url);
				const price = data.token.usd;
				client.setex(token, 600, price);

				return price;
			} catch (error) {
				console.error(`failed loading data for ${token}`);
			}

			return 0;
		})
	);

	console.log(result);
	res.json({ result });
});

app.listen(PORT);

console.log(`Listening on ${PORT}`);
