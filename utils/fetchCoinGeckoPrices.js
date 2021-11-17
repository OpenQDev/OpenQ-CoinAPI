const axios = require('axios');

function isEmpty(object) {
	return Object.keys(object).length === 0;
}

async function fetchCoinGeckoPrices(client, tokens) {
	const stringifiedTokens = tokens.join(',');
	const url = `https://api.coingecko.com/api/v3/simple/price?ids=${stringifiedTokens}&vs_currencies=usd`;
	try {
		const { data } = await axios.get(url);
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