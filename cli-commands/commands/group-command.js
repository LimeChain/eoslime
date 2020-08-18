const Command = require('./command');

class GroupCommand extends Command {
    constructor (commandDefinition) {
        super(commandDefinition);
    }

    async execute (args) {
        if (optionsProvided(args, this.options)) {
            await super.processOptions(args);
            this.hasBeenExecuted = true;
        } else {
            this.hasBeenExecuted = false;
        }
    }
}

const optionsProvided = function (args, commandOptions) {
    for (let i = 0; i < commandOptions.length; i++) {
        const option = commandOptions[i];
        if (args[option.name]) {
            return true;
        }
    }

    return false;
}

module.exports = GroupCommand;
