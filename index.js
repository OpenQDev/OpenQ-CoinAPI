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

app.get('/', (req, res) => {
	const token = req.query.token;
	try {
		client.get(token, async (err, price) => {
			if (err) throw err;

			if (price) {
				res.status(200).send({
					price,
					message: 'data retrieved from the cache'
				});
			} else {
				const result = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`);
				const coinPrice = result.data[token]['usd'];
				client.setex(token, 600, coinPrice);
				res.status(200).send({
					price: coinPrice.toString(),
					message: 'cache miss'
				});
			}
		});
	} catch (err) {
		res.status(500).send({ message: err.message });
	}
});

app.listen(PORT);

console.log(`Listening on ${PORT}`);