const AccountsTable = require('./accounts-table');
const Option = require('../../../../../option');

const accounts = require('../../accounts.json');

class AccountsOption extends Option {
    constructor() {
        super(
            'accounts',
            {
                "describe": "Lists all predefined accounts",
                "type": "string",
            }
        );

        this.accountsTable = new AccountsTable();
    }

    process(optionValue) {
        accounts.forEach(account => {
            this.accountsTable.addRow([account.name, account.publicKey, account.privateKey]);
        });
        
        this.accountsTable.draw();
    }
}

module.exports = new AccountsOption();
