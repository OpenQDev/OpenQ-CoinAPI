const cron = require('node-cron')
const redis = require('redis');
const axios = require('axios')
const redisPort = 6379;
const client = redis.createClient(redisPort, process.env.REDIS_URL);

	const getTokens = async()=>{
	const result = await axios.get(
		`https://api-polygon-tokens.polygon.technology/tokenlists/allTokens.tokenlist.json`
	);
	result.data.tokens.forEach((token, index)=>{
		client.zadd("tokenList", index, JSON.stringify(token))
		client.hmset("tokenObject", token.address, JSON.stringify(token))
	})
	}
cron.schedule('59 23 * * *', function() {
	getTokens()
  });
	getTokens();