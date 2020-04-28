const Command = require('../../../command');

const showCommandDefinition = require('./definition');

// eoslime nodeos show --accounts --logs

class ShowCommand extends Command {
    constructor() {
        super(showCommandDefinition);
    }

    define(...params) {
        return this.defineCommand(...params);
    }

    async execute(args) {
        await super.processOptions(args);
    }
}

module.exports = ShowCommand;
