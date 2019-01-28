const Command = require('./../command');

const compileCommandDefinition = require('./compile-command-definition.json');

// eoslime compile --path

class CompileCommand extends Command {

    constructor() {
        super(compileCommandDefinition.template, compileCommandDefinition.description);
    }

    defineOptions(yargs) {
        super(yargs, compileCommandDefinition.options);
    }

    execute(argv) { }
}

module.exports = CompileCommand;
