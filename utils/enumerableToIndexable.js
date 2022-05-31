const tokenList = require('../constants/polygon-mainnet-enumerable.json');
const fs = require('fs');

const enumerableToIndexable = (tokenList) => {
	let indexable = {};
	for (let item of tokenList) {
		indexable[item.address] = item;
	}
	return indexable;
};

const metadata = enumerableToIndexable(tokenList.tokens);
fs.writeFileSync('polygon-mainnet-mapping.json', JSON.stringify(metadata));