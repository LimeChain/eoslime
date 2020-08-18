const Command = require('../command');

const MESSAGE_COMMAND = require('./messages').COMMAND;
const testCommandDefinition = require('./definition');

const eoslime = require('../../../index');
const testUtils = require('./specific/utils');

// eoslime test --path --network --resource-usage=

class TestCommand extends Command {

    constructor (TestFramework) {
        super(testCommandDefinition);
        this.TestFramework = TestFramework;
    }

    async execute (args) {
        try {
            MESSAGE_COMMAND.Start();

            args.eoslime = eoslime.init();
            args.testFramework = new this.TestFramework();

            await super.processOptions(args);

            setTestsHelpers(args.eoslime);

            args.testFramework.setDescribeArgs(args.eoslime);
            await args.testFramework.runTests();

            MESSAGE_COMMAND.Success();
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }
}

const setTestsHelpers = function (eoslime) {
    eoslime.tests = {
        ...testUtils
    }
}

module.exports = TestCommand;
