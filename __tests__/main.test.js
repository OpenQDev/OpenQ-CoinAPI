const main = require('../main');

describe('OpenQ-CoinAPI', () => {
	let TOKEN_PRICE_1;
	let TOKEN_PRICE_2;

	let TOKEN_ADDRESS_1;
	let TOKEN_ADDRESS_2;

	beforeEach(() => {
		TOKEN_PRICE_1 = 543.21;
		TOKEN_PRICE_2 = 123.45;
		TOKEN_ADDRESS_1 = '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39';
		TOKEN_ADDRESS_2 = '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4';
	});

	it('should return the individual token prices on tokenPrices', async () => {
		jest.doMock('../utils/fetchCoinGeckoPrices', () => {
			return jest.fn(() => {
				return {
					[TOKEN_ADDRESS_1]: { usd: TOKEN_PRICE_1 },
					[TOKEN_ADDRESS_2]: { usd: TOKEN_PRICE_2 }
				};
			});
		});

		jest.doMock('../utils/fetchCachedToken', () => {
			return jest.fn(() => {
				return null;
			});
		});

		const mockFetchCoinGeckoPrices = require('../utils/fetchCoinGeckoPrices.js');
		const mockFetchCachedToken = require('../utils/fetchCachedToken.js');

		const req = {
			body: {
				"tokenVolumes": {
					[TOKEN_ADDRESS_1]: 2000000000000000000,
					[TOKEN_ADDRESS_2]: 2500000000000000000
				},
				"network": "polygon-pos"
			}
		};

		// Since we are mocking fetchCoinGeckoPrices and fetchCachedToken, the client can be an empty object
		const client = {};

		const result = await main(req, client, mockFetchCoinGeckoPrices, mockFetchCachedToken);

		const tokenPrice1 = result['tokenPrices'][TOKEN_ADDRESS_1];
		const tokenPrice2 = result['tokenPrices'][TOKEN_ADDRESS_2];

		expect(tokenPrice1).toEqual(TOKEN_PRICE_1);
		expect(tokenPrice2).toEqual(TOKEN_PRICE_2);
	});

	it('should return correct Total TVL aggregated across all tokens', async () => {
		jest.doMock('../utils/fetchCoinGeckoPrices', () => {
			return jest.fn(() => {
				return {
					[TOKEN_ADDRESS_1]: { usd: TOKEN_PRICE_1 },
					[TOKEN_ADDRESS_2]: { usd: TOKEN_PRICE_2 }
				};
			});
		});

		jest.doMock('../utils/fetchCachedToken', () => {
			return jest.fn(() => {
				return null;
			});
		});

		const mockFetchCoinGeckoPrices = require('../utils/fetchCoinGeckoPrices.js');
		const mockFetchCachedToken = require('../utils/fetchCachedToken.js');

		const req = {
			body: {
				"tokenVolumes": {
					[TOKEN_ADDRESS_1]: 2000000000000000000,
					[TOKEN_ADDRESS_2]: 2500000000000000000
				},
				"network": "polygon-pos"
			}
		};

		// Since we are mocking fetchCoinGeckoPrices and fetchCachedToken, the client can be an empty object
		const client = {};

		const result = await main(req, client, mockFetchCoinGeckoPrices, mockFetchCachedToken);

		const totalPrice = result['total'];

		expect(totalPrice).toEqual(1395.05);
	});

	it('should return correct TVLs per token given the tokenVolume', async () => {
		jest.doMock('../utils/fetchCoinGeckoPrices', () => {
			return jest.fn(() => {
				return {
					[TOKEN_ADDRESS_1]: { usd: TOKEN_PRICE_1 },
					[TOKEN_ADDRESS_2]: { usd: TOKEN_PRICE_2 }
				};
			});
		});

		jest.doMock('../utils/fetchCachedToken', () => {
			return jest.fn(() => {
				return null;
			});
		});

		const mockFetchCoinGeckoPrices = require('../utils/fetchCoinGeckoPrices.js');
		const mockFetchCachedToken = require('../utils/fetchCachedToken.js');

		const req = {
			body: {
				"tokenVolumes": {
					[TOKEN_ADDRESS_1]: 2000000000000000000,
					[TOKEN_ADDRESS_2]: 2500000000000000000
				},
				"network": "polygon-pos"
			}
		};

		// Since we are mocking fetchCoinGeckoPrices and fetchCachedToken, the client can be an empty object
		const client = {};

		const result = await main(req, client, mockFetchCoinGeckoPrices, mockFetchCachedToken);

		const token1VolumePrice = result['tokens'][TOKEN_ADDRESS_1];
		const token2VolumePrice = result['tokens'][TOKEN_ADDRESS_2];

		expect(token1VolumePrice).toEqual(2 * TOKEN_PRICE_1);
		expect(token2VolumePrice).toEqual(2.5 * TOKEN_PRICE_2);
	});
});