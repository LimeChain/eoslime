class CommandDefiner {
    constructor(yargs) {
        this.yargs = yargs;
    }

    define (command, ...params) {
        return {
            command: command.template,
            description: command.description,
            builder: this.build(command),
            handler: this.handle(command, ...params)
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

    handle (command, ...params) {
        return async (args) => {
            const result = await command.execute(args, ...params);
            if (!result) {
                this.yargs.showHelp();
            }
        }
    }
}

module.exports = CommandDefiner;
