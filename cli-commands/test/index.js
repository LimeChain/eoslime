const Command = require('./../command');
const testCommandDefinition = require('./definition');

const testUtils = require('./utils');

// eoslime test --path --network --accounts

class TestCommand extends Command {

    constructor() {
        super(testCommandDefinition);
    }

    async execute(args, TestFramework) {
        try {
            // commandMessages.StartCompilation();

            const optionsResults = await super.processOptions(args);
            const testFramework = new TestFramework(optionsResults.path);
            setTestsHelpers();

            testFramework.runTests();
        } catch (error) {
            // commandMessages.UnsuccessfulCompilation(error);
        }
    }
}

const setTestsHelpers = function () {
    // global.assert = chai.assert;
    // global.expect = chai.expect;
    Object.assign(global, testUtils);
    // Todo add accounts
    // global.accounts = importedAccounts;
}

module.exports = TestCommand;
