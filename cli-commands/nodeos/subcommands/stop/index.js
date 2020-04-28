const Command = require('../../../command');

const commandMessages = require('./messages');
const stopCommandDefinition = require('./definition');

// eoslime nodeos stop --path

class StopCommand extends Command {
    constructor() {
        super(stopCommandDefinition);
    }

    async execute(args) {
        
    }
}

module.exports = StopCommand;
