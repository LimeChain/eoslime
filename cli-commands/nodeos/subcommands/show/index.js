const Command = require('../../../command');

const commandMessages = require('./messages');
const showCommandDefinition = require('./definition');

// eoslime nodeos show --accounts --logs

class ShowCommand extends Command {
    constructor() {
        super(showCommandDefinition);
    }

    async execute(args) {
        
    }
}

module.exports = ShowCommand;
