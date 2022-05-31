const axios = require('axios');

async function fetchCoinGeckoPrices(client, tokens, network) {
	const stringifiedTokens = tokens.join(',');

	const url = `https://api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${stringifiedTokens}&vs_currencies=usd`;
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