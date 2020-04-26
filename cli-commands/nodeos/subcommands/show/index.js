const Command = require('../../../command');

const showCommandDefinition = require('./definition');

// eoslime nodeos show --accounts --logs

class ShowCommand extends Command {
    constructor() {
        super(showCommandDefinition);
    }

    async execute(args) {
        await super.processOptions(args);
    }
}

module.exports = ShowCommand;
