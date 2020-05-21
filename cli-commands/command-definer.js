class CommandDefiner {
    constructor(yargs) {
        this.yargs = yargs;
    }

    define (command) {
        return {
            command: command.template,
            description: command.description,
            builder: this.build(command),
            handler: this.handle(command)
        }
    }

    build (command) {
        return (yargs) => {
            for (const subcommand of command.subcommands) {
                yargs.command(this.define(subcommand));
            }

            for (const option of command.options) {
                yargs = yargs.options(option.name, option.definition);
            }

            return yargs;
        }
    }

    handle (command) {
        return async (args) => {
            const result = await command.execute(args);
            if (!result) {
                this.yargs.showHelp();
            }
        }
    }
}

module.exports = CommandDefiner;
