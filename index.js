const express = require('express');
const cors = require('cors');
const redis = require('redis');
const axios = require('axios');
const main = require('./main');
const enumerable = require('./constants/polygon-mainnet-enumerable.json');
const indexable = require('./constants/openq-local-indexable.json');
const fetchCoinGeckoPrices = require('./utils/fetchCoinGeckoPrices.js');
const fetchCachedToken = require('./utils/fetchCachedToken.js');
const metadata = require('./metadata');
const metadataByToken = require('./metadataByToken');

require('dotenv').config();

// Prepare Redis
const redisPort = 6379;
const client = redis.createClient(redisPort, process.env.REDIS_URL);

client.on('error', err => {
	console.log(err);
});

const PORT = 8081;
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.ORIGIN_URL }));

app.post('/tvl', async (req, res) => {
	try {
		const result = await main(
			req,
			client,
			fetchCoinGeckoPrices,
			fetchCachedToken
		);
		res.json(result);
	} catch (error) {
		res.status(403).json(error);
	}
});

app.get('/tokenMetadata', async (req, res) => {
	try {
		const tokenMetadata = await metadata(req, client);
		const withPath = tokenMetadata.map((token) => {
			if ((!token.path && !token.logoURI) || token.path?.match(/github.com/) || token.path?.match(/drive.google/) || token.logoURI?.match(/github.com/) || token.logoURI?.match(/drive.google/)) {
				return { ...token, path: '/crypto-logos/ERC20.svg', logoURI: '/crypto-logos/ERC20.svg' };
			}
			return token;
		});
		res.json(withPath);
	} catch (err) {
		res.status(500).json(error);
	}
});

app.get('/tokenMetadata/:address', async (req, res) => {
	try {
		const singleTokenMetadata = await metadataByToken(client, req.params.address);
		res.json(singleTokenMetadata);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

app.get("/staticMetadata/:type", async (req, res) => {
	const { type } = req.params;
	switch (type) {
		case "enumerable": {
			try {
				res.json(enumerable.tokens);
			}
			catch (err) {
				res.status(500);
			}
		}
			break;
		case 'indexable': {
			try {
				res.json(indexable);
			}
			catch (err) {
				res.status(500);
			}
		}
			break;
		default:
			res.status(404);
	}
});

app.listen(PORT);

console.log(`Listening on ${PORT}`);
