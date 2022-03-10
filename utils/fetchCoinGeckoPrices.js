const axios = require('axios');

async function fetchCoinGeckoPrices(client, tokens) {
	const stringifiedTokens = tokens.join(',');
	console.log(stringifiedTokens);

	const url = `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${stringifiedTokens}&vs_currencies=usd`;
	try {
		const { data } = await axios.get(url);
		console.log(data);

		for (const [key, value] of Object.entries(data)) {
			client.setex(key, 600, value['usd']);
		}
		return data;
	} catch (error) {
		console.error(`Failed loading data for ${tokens}: ${error}`);
		return {};
	}
}

module.exports = fetchCoinGeckoPrices;