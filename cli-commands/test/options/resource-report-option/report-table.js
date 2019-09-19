const chalk = require('chalk').default;
const CLITable = require('cli-table');

const TABLE_HEAD = {
    head: ['', 'Contract', 'Action', 'Transaction ID', 'CPU', 'NET', 'RAM']
}

class ReportTable {
    constructor() {
        this.table = new CLITable(TABLE_HEAD);
    }

    addRow(rowData) {
        rowData[4] = `${rowData[4]} μs`;
        rowData[5] = `${rowData[5]} Bytes`;
        rowData[6] = `${rowData[6]} Bytes`;
        this.table.push(rowData);
    }

    addSection(sectionName, sectionRows) {
        this.table.push({ [chalk.cyanBright(sectionName)]: [] });

        for (let i = 0; i < sectionRows.length; i++) {
            const sectionRow = sectionRows[i];
            sectionRow.unshift('');
            this.addRow(sectionRow);
        }
    }

    draw() {
        console.log(this.table.toString());
    }
}

module.exports = ReportTable;
