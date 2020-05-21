const AccountsTable = require('./specific/accounts-table');
const Command = require('../../../command');

const commandMessages = require('./messages');
const accountsCommandDefinition = require('./definition');

const predefinedAccounts = require('../common/accounts');

// eoslime nodeos show accounts

class AccountsCommand extends Command {
    constructor() {
        super(accountsCommandDefinition);
    }

    async execute (args) {
        try {
            commandMessages.PreloadedAccounts();

            const accountsTable = new AccountsTable();
            const accounts = predefinedAccounts.accounts();

            for (let i = 0; i < accounts.length; i++) {
                accountsTable.addRow([accounts[i].name, accounts[i].publicKey, accounts[i].privateKey]);
            }

            accountsTable.draw();
        } catch (error) {
            commandMessages.UnsuccessfulShowing(error);
        }

        return true;
    }
}

module.exports = AccountsCommand;
