const chalk = require('chalk').default;
const CLITable = require('cli-table');

const logger = require('./logger');

class Table {
    constructor (tableHead) {
        this.table = new CLITable(tableHead);
    }

    addRow (rowData) {
        this.table.push(rowData);
    }

    addSection (sectionName, sectionRows) {
        this.table.push({
            [chalk.cyanBright(sectionName)]: addEmptyColumns(this.table.options.head.length)
        });

        if (sectionRows) {
            for (let i = 0; i < sectionRows.length; i++) {
                const sectionRow = sectionRows[i];
                sectionRow.unshift('');
                this.addRow(sectionRow);
            }
        }
    }

    draw () {
        logger.log(this.table.toString());
    }
}

const addEmptyColumns = function (numberOfColumns) {
    let arr = [];

    for (let i = 0; i < numberOfColumns - 1; i++) {
        arr.push('');
    }

    return arr;
}

module.exports = Table;
