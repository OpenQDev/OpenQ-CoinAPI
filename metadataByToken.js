const polygonMainnetTokenMetadata = require('./constants/polygon-mainnet.json')
const mumbaiTokenMetadata = require('./constants/polygon-mumbai.json')
const localTokenMetadata = require('./constants/local.json')
const ethers = require('ethers')

const fetchCachedToken = require('./utils/fetchCachedMetadata')
const fetchMetadata = require('./utils/fetchMetadata')

const metadata = async (client, address) => {
  const promise = new Promise(async (resolve, reject) => {
    let tokenMetadata;
    cachedMetadata = await fetchCachedToken(client, address);
    tokenMetadata = cachedMetadata;
      if (!metadata) {
        metadata = fetchedMetadata.find(
          tokenData => tokenData.address === address.toLowerCase()
        )
      }
    if (!tokenMetadata) {
      const checkSummedAddress = ethers.utils.getAddress(address)
      const fetchedMetadata = await fetchMetadata(client)
      let metadata = {}
      switch (process.env.DEPLOY_ENV) {
        case 'mainnet':
          metadata = polygonMainnetTokenMetadata[checkSummedAddress]
          break
        case 'mumbai':
          metadata = mumbaiTokenMetadata[checkSummedAddress]
          break

        case 'local':
          metadata = localTokenMetadata[checkSummedAddress]
      }
      if (!metadata) {
        metadata = {
          chainId: 137,
          name: 'Custom Token',
          symbol: 'CUSTOM',
          decimals: 18,
          address: checkSummedAddress,
          path: '/ERC20.svg'
        }
      }
      
      tokenMetadata = { [checkSummedAddress]: {...metadata, address: ethers.utils.getAddress(metadata.address)} }
    }
    resolve(tokenMetadata)
  })
  return promise
}
module.exports = metadata
