const Command = require('../../../command');

const commandMessages = require('./messages');
const startCommandDefinition = require('./definition');

// eoslime nodeos start --path

class StartCommand extends Command {
    constructor() {
        super(startCommandDefinition);
    }

    define(...params) {
        return this.defineCommand(...params);
    }

    async execute(args) {
        
    }
}

module.exports = StartCommand;
