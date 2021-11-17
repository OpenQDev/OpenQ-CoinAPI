function tallyTvl(tokenPriceMap, tokenVolumes) {
	let total = 0;
	for (const [key, value] of Object.entries(tokenPriceMap)) {
		total += parseFloat(value.usd) * tokenVolumes[key];
	}
	return total;
}

module.exports = tallyTvl;