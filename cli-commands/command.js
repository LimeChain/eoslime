
class Command {
    constructor(commandDefinition) {
        this.template = commandDefinition.template;
        this.description = commandDefinition.description;
        this.options = commandDefinition.options;
    }

    async processOptions(args) {
        const optionResults = {};

        for (let i = 0; i < this.options.length; i++) {
            const option = this.options[i];

            if (args.hasOwnProperty(option.name)) {
                const result = await option.process(args[option.name], args);
                optionResults[option.name] = result;
            }
        }

        return optionResults;
    }

    define(...params) {
        return {
            command: this.template,
            description: this.description,
            builder: this.defineCommandOptions(),
            handler: this.defineCommandExecution(...params)
        }
    }

    defineCommandOptions() {
        return (yargs) => {
            for (const option of this.options) {
                yargs = yargs.options(option.name, option.definition);
            }

            return yargs;
        }
    }

    defineCommandExecution(...params) {
        return async (args) => {
            await this.execute(args, ...params);
        }
    }

    execute(args) { }

}

module.exports = Command;
