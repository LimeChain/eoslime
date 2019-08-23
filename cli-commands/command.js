
class Command {
    constructor(commandDefinition) {
        this.template = commandDefinition.template;
        this.description = commandDefinition.description;
        this.options = commandDefinition.options;
    }

    defineOptions(yargs) {
        for (const option in this.options) {
            yargs.options(option.name, option.definition);
        }
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

    execute(args) { }

    static executeWithContext(initContext) {
        return async (args) => {
            await initContext.execute(args);
        }
    }
}

module.exports = Command;
