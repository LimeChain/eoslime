const assert = require('assert');

module.exports = {
    expectAssert: async function (promise, errorMessage) {
        const result = await expectEOSError(promise, 'eosio_assert_message_exception', 'assert');
        if (errorMessage && result.error) {
            result.error = result.message.search(errorMessage) >= 0;
            result.text = `Expected assert with '${errorMessage}' message, got '${result.message}' instead`;
        }
        assert(result.error, result.text);
    },
    expectMissingAuthority: async function (promise) {
        const result = await expectEOSError(promise, 'missing_auth_exception', 'missing authority');
        assert(result.error, result.text);
    },
    expectIrrelevantAuthority: async function (promise) {
        const result = await expectEOSError(promise, 'irrelevant_auth_exception', 'irrelevant authority');
        assert(result.error, result.text);
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
        return {
            message,
            error: expectedError,
            text: `Expected ${errorInfo}, got '${message}' instead`
        };
    }
    assert.fail(`Expected ${errorInfo} not received`);
}