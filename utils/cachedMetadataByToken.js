async function fetchCachedMetadata(client, address) {
	const cachedMetadata = new Promise((resolve,) => {
		 
    await client.hget('tokenObject', address, async (err, data) => {
      if (err) {
        throw err
      }
      resolve({ [address]: JSON.parse(data) })
	});
})
return cachedMetadata
}

module.exports = fetchCachedMetadata;