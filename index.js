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
