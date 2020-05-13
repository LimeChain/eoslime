const ParentCommand = require('../parent-command');

const StartCommand = require('./subcommands/start');
const StopCommand = require('./subcommands/stop');
const ShowCommand = require('./subcommands/show');

const nodeosCommandDefinition = require('./definition');

// eoslime nodeos <start|stop|show>

class NodeosCommand extends ParentCommand {
    constructor() {
        super(nodeosCommandDefinition);

        this.subcommands.push(new StartCommand());
        this.subcommands.push(new StopCommand());
        this.subcommands.push(new ShowCommand());
    }
}

module.exports = NodeosCommand;
