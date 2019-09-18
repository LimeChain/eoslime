const Command = require('./../command');
const testCommandDefinition = require('./definition');

const testUtils = require('./utils');

// eoslime test --path --network --resource-report

class TestCommand extends Command {

    constructor() {
        super(testCommandDefinition);
    }

    async execute(args, TestFramework) {
        try {
            const testFramework = new TestFramework(optionsResults.path);

            const optionsResults = await super.processOptions(args, testFramework);
            setTestsHelpers();

            testFramework.runTests();
        } catch (error) {
            console.log(error);
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
