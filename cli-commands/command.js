class Command {
    constructor(template, description) {
        this.template = template;
        this.description = description;
    }

    defineOptions(yargs, options) {
        for (const option of options) {
            yargs.options(option.name, option.definition);
        }
    }

    __execute(args, commandOptions) {
        for (let i = 0; i < commandOptions.length; i++) {
            let option = commandOptions[i];

            if (args.hasOwnProperty(option.name)) {
                option.execute(args[option.name]);
            }
        }
    }
}

module.exports = Command;
