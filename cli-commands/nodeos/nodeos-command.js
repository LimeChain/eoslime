const Command = require('./../command');

const nodeosCommandDefinition = require('./nodeos-command-definition.json');

// eoslime nodeos --port --accounts

class NodeosCommand extends Command {

    constructor() {
        super(nodeosCommandDefinition.template, nodeosCommandDefinition.description);
    }


    defineOptions(yargs) {
        super(yargs, nodeosCommandDefinition.options);
    }

    execute(argv) { }
}

module.exports = NodeosCommand;
