const Command = require('./../command');

const historyCommandDefinition = require('./history-command-definition.json');

// eoslime history --limit

class HistoryCommand extends Command {

    constructor() {
        super(historyCommandDefinition.template, historyCommandDefinition.description);
    }

    defineOptions(yargs) {
        super(yargs, historyCommandDefinition.options);
    }

    execute(argv) { }
}

module.exports = HistoryCommand;
