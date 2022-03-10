const main = require('../main');

describe('OpenQ-CoinAPI', () => {
	it('should return the individual token prices on tokenPrices', () => {
		jest.mock('../lib/checkWithdrawalEligibility', (string1, string2) => {
			return jest.fn(() => {
				return { canWithdraw: true, issueId: "mockIssueId" };
			});
		});
	});

	it('should return correct TVLs per token given the tokenVolume', () => {
	});

	it('should return correct Total TVL aggregated across all tokens', () => {
	});
});