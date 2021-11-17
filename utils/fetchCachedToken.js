async function fetchCachedToken(client, token) {
	const cachedPrice = new Promise((resolve,) => {
		client.get(token, (err, price) => {
			// price will be null if there's an error or cache miss
			resolve(price);
		});
	});
	return cachedPrice;
}

module.exports = fetchCachedToken;