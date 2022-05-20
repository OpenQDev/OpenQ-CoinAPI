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

app.get("/tokenMetadata", async (req, res) =>{	
	try {
		const {query} = req;
		const cursor = parseInt(query.cursor)
		const limit = parseInt(query.limit)		
		 await client.zrange("tokenList", cursor, cursor+limit-1, async(err, data)=>{
			if(err){
				throw(err)			
			}
			res.json( data.map(token=>JSON.parse(token)))
		}
		);	
}
	catch (error) {
		res.status(500).send({ message: err.message });
	}})

	
app.get("/tokenMetadata/:address", async (req, res) =>{	
	try {
		
		 await client.hget("tokenObject", req.params.address,  async(err, data)=>{
			if(err){
				throw(err)			
			}
			res.json({[req.params.address]: JSON.parse(data)})
		}
		);	
}
	catch (error) {
		res.status(500).send({ message: error.message });
	}})

app.listen(PORT);

console.log(`Listening on ${PORT}`);
