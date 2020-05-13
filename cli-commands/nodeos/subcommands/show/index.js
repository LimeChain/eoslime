const ParentCommand = require('../../../parent-command');

const LogsCommand = require('./subcommands/logs');
const AccountsCommand = require('./subcommands/accounts');

const showCommandDefinition = require('./definition');

// eoslime nodeos show

class ShowCommand extends ParentCommand {
    constructor() {
        super(showCommandDefinition);

        this.subcommands.push(new AccountsCommand());
        this.subcommands.push(new LogsCommand());
    }
}

module.exports = ShowCommand;
