const axios = require("axios");

async function fetchCoinGeckoPrices(client, tokens, network) {
  const stringifiedTokens = tokens.join(",");

  let url = `https://pro-api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${stringifiedTokens}&vs_currencies=usd`;
  if (process.env.COINGECK_API_KEY) {
    url = `${url}&x_cg_pro_api_key=${process.env.COINGECK_API_KEY}`;
  }
	
  try {
    const rawData= await axios.get(url);

	const data =	{ ...rawData.data, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { usd: 1 }, "0xc2132D05D31c914a87C6611C10748AEb04B58e8F": {usd: 1} };
    for (const [key, value] of Object.entries(data)) {
      client.setex(key, 600, value["usd"]);
    }
    return data;
  } catch (error) {
    console.error(`Failed loading data for ${tokens}: ${error}`);
    return {};
  }
}

module.exports = fetchCoinGeckoPrices;
