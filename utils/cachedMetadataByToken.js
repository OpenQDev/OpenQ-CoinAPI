async function cachedMetadataByToken(client, address) {
	const cachedMetadata = new Promise(async(resolve,) => {
		 
    await client.hget('tokenObject', address, async (err, data) => {
      if (err) {
        throw err
      }
      resolve(JSON.parse(data))
	});
})

return cachedMetadata
}

module.exports = cachedMetadataByToken;