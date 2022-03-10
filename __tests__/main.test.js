const main = require('../main');

describe('OpenQ-CoinAPI', () => {
	beforeAll(() => {
		mock = new MockAdapter(axios);
	});

	it('shoudl pass', () => {
		jest.mock('../lib/checkWithdrawalEligibility', (string1, string2) => {
			return jest.fn(() => {
				return { canWithdraw: true, issueId: "mockIssueId" };
			});
		});

		expect(1).toEqual(1);
	});
});