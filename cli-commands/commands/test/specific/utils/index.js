const assert = require('assert');

module.exports = {
    expectAssert: async function (promise) {
        return expectEOSError(promise, 'eosio_assert_message_exception', 'assert');
    },
    expectMissingAuthority: async function (promise) {
        return expectEOSError(promise, 'missing_auth_exception', 'missing authority');
    },
    // Todo: Uncomment it once test cli command is ready
    // createTestingAccounts: async function () {
    //     let accounts = await Account.createRandoms(10);

    //     for (let i = 0; i < accounts.length; i++) {
    //         await accounts[i].loadRam({ bytes: 2500000, b });
    //         await accounts[i].loadBandwidth({ cpuQuantity: '100', netQuantity: '100' });
    //     }

    //     return accounts;
    // }
}

const expectEOSError = async function (promise, errorType, errorInfo) {
    try {
        await promise;
    } catch (error) {
        const message = error.message || error;
        const expectedError = message.search(errorType) >= 0;
        assert(expectedError, `Expected ${errorInfo}, got '${message}' instead`);
        return;
    }
    assert.fail(`Expected ${errorInfo} not received`);
}