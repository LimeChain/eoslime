const Command = require('./../command');
const testCommandDefinition = require('./definition');

const eoslime = require('./../../index');

const testUtils = require('./utils');

// eoslime test --path --network --resource-usage=

class TestCommand extends Command {

    constructor() {
        super(testCommandDefinition);
    }

    define(...params) {
        return this.defineCommand(...params);
    }

    async execute(args, TestFramework) {
        try {
            args.eoslime = eoslime.init();

            args.testFramework = new TestFramework();

            await super.processOptions(args);

            setTestsHelpers(args.eoslime);

            args.testFramework.setDescribeArgs(args.eoslime);
            args.testFramework.runTests();
        } catch (error) {
            console.log(error);
        }
    }
}

const setTestsHelpers = function (eoslime) {
    eoslime.tests = {
        ...testUtils
    }
}

module.exports = TestCommand;
