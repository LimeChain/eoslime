const Table = require('../../../table');

const TABLE_HEAD = {
    head: ['', 'Contract', 'Action', 'CPU ( MIN | MAX )', 'NET ( MIN | MAX )', 'RAM ( MIN | MAX )', 'Calls']
}

class ReportTable extends Table {
    constructor() {
        super(TABLE_HEAD);
    }
}

module.exports = ReportTable;
