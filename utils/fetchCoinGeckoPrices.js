const axios = require("axios");

async function fetchCoinGeckoPrices(client, tokens, network) {
  const stringifiedTokens = tokens.join(",");

  let url = `https://api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${stringifiedTokens}&vs_currencies=usd`;
  if (process.env.COINGECK_API_KEY) {
    url = `${url}&x_cg_pro_api_key=${process.env.COINGECK_API_KEY}`;
  }
  try {
    const rawData= await axios.get(url);

	const data =	{ ...rawData.data, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { usd: 1 } };
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
