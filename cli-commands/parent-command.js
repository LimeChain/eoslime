const Command = require('./command');

class ParentCommand extends Command {
    constructor(commandDefinition) {
        super(commandDefinition);
    }

    async execute (args) {
        if (validate(args, this.options)) {
            await super.processOptions(args);
            return true;
        }

        return false;
    }
}

const validate = function (args, commandOptions) {
    for (let i = 0; i < commandOptions.length; i++) {
        const option = commandOptions[i];
        if (args[option.name]) {
            return true;
        }
    }

    return false;
}

module.exports = ParentCommand;
