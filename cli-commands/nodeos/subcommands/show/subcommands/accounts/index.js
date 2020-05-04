const Command = require('../../../../../command');
const AccountsTable = require('./accounts-table');

const commandMessages = require('./messages');
const accounts = require('./accounts.json');
const accountsCommandDefinition = require('./definition');

// eoslime nodeos show accounts

class AccountsCommand extends Command {
    constructor() {
        super(accountsCommandDefinition);
    }

    async execute(args) {
        try {
            commandMessages.PredefinedAccounts();
            showAccounts();
            return true;
        } catch (error) {
            commandMessages.UnsuccessfulShowing(error);
        }
        return false;
    }
}

const showAccounts = function () {
    let accountsTable = new AccountsTable();
    accounts.forEach(account => {
        accountsTable.addRow([account.name, account.publicKey, account.privateKey]);
    });
    accountsTable.draw();
}

module.exports = AccountsCommand;
