function tallyTvl(tokenPriceMap) {
	let total = 0;
	for (const [, value] of Object.entries(tokenPriceMap)) {
		// Apparently Math.round is like 100x faster than .toFixed(2)
		total += Math.round(parseFloat(value) * 100) / 100;
	}
	return total;
}

module.exports = tallyTvl;