const Table = require('../../../../../table');

const TABLE_HEAD = {
    head: ['Account', 'Public Key', 'Private Key']
}

class AccountsTable extends Table {
    constructor() {
        super(TABLE_HEAD);
    }
}

module.exports = AccountsTable;
