const AccountsTable = require('./specific/accounts-table');
const Command = require('../../../command');

const MESSAGE_COMMAND = require('./messages').COMMAND;
const accountsCommandDefinition = require('./definition');

const predefinedAccounts = require('../common/accounts');

// eoslime nodeos show accounts

class AccountsCommand extends Command {
    constructor () {
        super(accountsCommandDefinition);
    }

    async execute (args) {
        try {
            MESSAGE_COMMAND.Start();

            const accountsTable = new AccountsTable();
            const accounts = predefinedAccounts.accounts();

            for (let i = 0; i < accounts.length; i++) {
                accountsTable.addRow([accounts[i].name, accounts[i].publicKey, accounts[i].privateKey]);
            }

            accountsTable.draw();
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }
}

module.exports = AccountsCommand;
