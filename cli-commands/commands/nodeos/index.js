const GroupCommand = require('../group-command');

const StartCommand = require('./subcommands/start');
const StopCommand = require('./subcommands/stop');
const LogsCommand = require('./subcommands/logs');
const AccountsCommand = require('./subcommands/accounts');

const nodeosCommandDefinition = require('./definition');

// eoslime nodeos <start|stop|logs|accounts>

class NodeosCommand extends GroupCommand {
    constructor() {
        super(nodeosCommandDefinition);

        this.subcommands.push(new StartCommand());
        this.subcommands.push(new StopCommand());
        this.subcommands.push(new LogsCommand());
        this.subcommands.push(new AccountsCommand());
    }
}

module.exports = NodeosCommand;
