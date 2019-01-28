const Command = require('./../command');

const testCommandDefinition = require('./test-command-definition.json');

// eoslime test --path --network --accounts

class TestCommand extends Command {

    constructor() {
        super(testCommandDefinition.template, testCommandDefinition.description);
    }

    defineOptions(yargs) {
        super(yargs, testCommandDefinition.options);
    }

    execute(argv) { }
}

module.exports = TestCommand;
