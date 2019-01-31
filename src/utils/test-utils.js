const assert = require('assert');
const Account = require('./../account/account');

module.exports = {
    expectAssert: function (promise) {
        return expectEOSError(promise, 'eosio_assert_message_exception', 'assert');
    },
    expectMissingAuthority: function (promise) {
        return expectEOSError(promise, 'missing_auth_exception', 'missing authority');
    },
    createTestingAccounts: async function () {
        let accounts = await Account.createRandoms(10);

        for (let i = 0; i < accounts.length; i++) {
            await accounts[i].loadRam({ bytes: 2500000, b });
            await accounts[i].loadBandwidth({ cpuQuantity: '100', netQuantity: '100' });
        }

        return accounts;
    }
}

let expectEOSError = async function (promise, errorType, errorInfo) {
    try {
        await promise;
    } catch (error) {
        const expectedError = error.search(errorType) >= 0;
        assert(expectedError, `Expected ${errorInfo}, got '${error}' instead`);
        return;
    }
    assert.fail(`Expected ${errorInfo} not received`);
}