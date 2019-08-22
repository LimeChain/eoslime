class Command {
    constructor(commandDefinition) {
        this.template = commandDefinition.template;
        this.description = commandDefinition.description;
        this.options = {};

        for (const option of commandDefinition.options) {
            this.options[option.name] = option;
            yargs.options(option.name, option.definition);
        }
    }

    processOptions(args, postExecuteCallback = function (option, result) { }) {
        for (let i = 0; i < this.options.length; i++) {
            let option = this.options[i];

            if (args.hasOwnProperty(option.name)) {
                let result = option.process(args[option.name], args);
                postExecuteCallback(option, result);
            }
        }
    }
}

module.exports = Command;
