const AccountsTable = require('./accounts-table');
const Command = require('../../../command');

const accounts = require('./accounts.json');

const commandMessages = require('./messages');
const accountsCommandDefinition = require('./definition');

// eoslime nodeos show accounts

class AccountsCommand extends Command {
    constructor() {
        super(accountsCommandDefinition);
    }

    async execute(args) {
        try {
            commandMessages.PreloadedAccounts();
            
            let accountsTable = new AccountsTable();
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
