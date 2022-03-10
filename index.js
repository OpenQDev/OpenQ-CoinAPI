const express = require('express');
const cors = require('cors');
const redis = require('redis');
const axios = require('axios');
const main = require('./main');
const fetchCoinGeckoPrices = require('./utils/fetchCoinGeckoPrices.js');
const fetchCachedToken = require('./utils/fetchCachedToken.js');

require('dotenv').config();

// Prepare Redis
const redisPort = 6379;
const client = redis.createClient(redisPort, process.env.REDIS_URL);

client.on('error', (err) => {
	console.log(err);
});

const PORT = 8081;
const app = express();

app.use(express.json());
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

app.post('/tvl', async (req, res) => {
	try {
		const result = await main(req, client, fetchCoinGeckoPrices, fetchCachedToken);
		res.json(result);
	} catch (error) {
		res.status(403).json(error);
	}
});

app.listen(PORT);

console.log(`Listening on ${PORT}`);
