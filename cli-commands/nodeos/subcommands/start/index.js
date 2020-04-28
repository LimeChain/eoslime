const Command = require('../../../command');

const commandMessages = require('./messages');
const startCommandDefinition = require('./definition');

// eoslime nodeos start --path

class StartCommand extends Command {
    constructor() {
        super(startCommandDefinition);
    }

    async execute(args) {
        
    }
}

module.exports = StartCommand;
