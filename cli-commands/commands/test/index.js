const Command = require('../command');
const testCommandDefinition = require('./definition');

const eoslime = require('../../../index');

const testUtils = require('./specific/utils');

// eoslime test --path --network --resource-usage=

class TestCommand extends Command {

    constructor(TestFramework) {
        super(testCommandDefinition);
        this.TestFramework = TestFramework;
    }

    async execute (args) {
        try {
            args.eoslime = eoslime.init();
            args.testFramework = new this.TestFramework();

            await super.processOptions(args);

            setTestsHelpers(args.eoslime);

            args.testFramework.setDescribeArgs(args.eoslime);
            args.testFramework.runTests();
        } catch (error) {
            console.log(error);
        }

        return true;
    }
}

const setTestsHelpers = function (eoslime) {
    eoslime.tests = {
        ...testUtils
    }
}

module.exports = TestCommand;
