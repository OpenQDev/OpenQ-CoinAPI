const axios = require('axios');

async function fetchMetadata(client) {
	const cachedMetadata = new Promise(async(resolve) => {
		try{
			const result = await axios.get(
				'https://api-polygon-tokens.polygon.technology/tokenlists/allTokens.tokenlist.json'
			);
			result.data.tokens.forEach(async(token, index) => {
				client.zadd('tokenList', index, JSON.stringify(token));
			});
			resolve (result.data.tokens);
		}
		catch(error){
			resolve ([]);
			console.log(error);
		}
	});
	return cachedMetadata;
}

module.exports = fetchMetadata;