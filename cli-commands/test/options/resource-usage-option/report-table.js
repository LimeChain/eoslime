const chalk = require('chalk').default;
const CLITable = require('cli-table');

const TABLE_HEAD = {
    head: ['', 'Contract', 'Action', 'CPU ( MIN | MAX )', 'NET ( MIN | MAX )', 'RAM ( MIN | MAX )', 'Calls']
}

class ReportTable {
    constructor() {
        this.table = new CLITable(TABLE_HEAD);
    }

    addRow(rowData) {
        this.table.push(rowData);
    }

    addSection(sectionName, sectionRows) {
        this.table.push({ [chalk.cyanBright(sectionName)]: ['', '', '', '', '', ''] });

        if (sectionRows) {
            for (let i = 0; i < sectionRows.length; i++) {
                const sectionRow = sectionRows[i];
                sectionRow.unshift('');
                this.addRow(sectionRow);
            }
        }
    }

    draw() {
        console.log(this.table.toString());
    }
}

module.exports = ReportTable;
