const assert = require('assert');

module.exports = {
    expectAssert: function (promise) {
        return expectEOSError(promise, 'eosio_assert_message_exception', 'assert');
    },
    expectMissingAuthority: function (promise) {
        return expectEOSError(promise, 'missing_auth_exception', 'missing authority');
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