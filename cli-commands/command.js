class Command {
    constructor(template, description) {
        this.template = template;
        this.description = description;
    }

    defineOptions(yargs, options) {
        for (const option of options) {
            yargs.positional(option.name, option.definition);
        }
    }

    execute(argv) { }
}

module.exports = Command;
