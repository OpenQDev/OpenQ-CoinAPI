const axios = require("axios");

async function fetchCoinGeckoPrices(client, tokens, network) {
  const stringifiedTokens = tokens.join(",");

  let url = `https://api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${stringifiedTokens}&vs_currencies=usd`;
  if (process.env.COINGECK_API_KEY) {
    url = `https://pro-api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${stringifiedTokens}&vs_currencies=usd&x_cg_pro_api_key=${process.env.COINGECK_API_KEY}`;
  }
	
  try {
    const rawData= await axios.get(url);

  const {data} =	rawData;
	const usdcPrice = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
	const usdtPrice = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
	if(data[usdcPrice]) data[usdcPrice] = {usd: 1};
	if(data[usdtPrice]) data[usdtPrice] = {usd: 1};
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
