const Command = require('./../command');

const nodeosCommandDefinition = require('./definition');

// eoslime nodeos <start|stop|show>

class NodeosCommand extends Command {
    constructor() {
        super(nodeosCommandDefinition);
    }
}

module.exports = NodeosCommand;
