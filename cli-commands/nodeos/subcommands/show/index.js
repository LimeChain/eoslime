const Command = require('../../../command');

const LogsCommand = require('./subcommands/logs');
const AccountsCommand = require('./subcommands/accounts');

const showCommandDefinition = require('./definition');

// eoslime nodeos show

class ShowCommand extends Command {
    constructor() {
        super(showCommandDefinition);

        this.subcommands = [
            new AccountsCommand(), new LogsCommand()
        ]
    }

    define(...params) {
        return {
            command: this.template,
            description: this.description,
            builder: (yargs) => {
                yargs.usage(`Usage: $0 nodeos ${this.template} [command]`);
                
                for (const subcommand of this.subcommands) {
                    yargs.command(subcommand.define(...params));
                }
    
                yargs.demandCommand(1, '');
    
                return yargs;
            }
        }
    }
}

module.exports = ShowCommand;
