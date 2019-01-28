const Command = require('./../command');

const initCommandDefinition = require('./init-command-definition.json');

// eoslime init --with-example

class InitCommand extends Command {

    constructor() {
        super(initCommandDefinition.template, initCommandDefinition.description);
    }

    defineOptions(yargs) {
        super(yargs, initCommandDefinition.options);
    }

    execute(argv) { }
}

module.exports = InitCommand;
