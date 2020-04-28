const Command = require('./../command');

const StartCommand = require('./subcommands/start');
const StopCommand = require('./subcommands/stop');
const ShowCommand = require('./subcommands/show');

const nodeosCommandDefinition = require('./definition');

// eoslime nodeos <start|stop|show>

class NodeosCommand extends Command {
    constructor() {
        super(nodeosCommandDefinition);

        this.subcommands = [
            new StartCommand(), new StopCommand(), new ShowCommand()
        ]
    }

    define(...params) {
        return {
            command: this.template,
            description: this.description,
            builder: (yargs) => {
                yargs.usage(`Usage: $0 ${this.template} [command]`);
                
                for (const subcommand of this.subcommands) {
                    yargs.command(subcommand.define(...params));
                }
    
                yargs.demandCommand(1, '');
    
                return yargs;
            }
        }
    }
}

module.exports = NodeosCommand;
