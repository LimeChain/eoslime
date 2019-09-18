const Option = require('./../../option');
const CLITable = require('cli-table');

class ResourceReportOption extends Option {
    constructor() {
        super(
            'network',
            {
                "describe": "Provides you a report for all contract functions used in the the tests with their RAM and Bandwidth usage",
                "type": "boolean",
                "default": "false",
            }
        );

    }

    process(optionValue, testFramework) {
        if (optionValue) {
            const cliTable = new CLITable();
            eoslime.Contract.on('init', (contract) => {
                for (let i = 0; i < contract._methods.length; i++) {
                    const contractMethod = contract._methods[i];
                    contractMethod.on('processed', (outputs) => {
                        cliTable.push({
                            contract: contract.name,
                            method: contractMethod.name,
                            txReceipt: outputs.tx
                        })
                    });
                }
            });

            testFramework.on('allFinished', () => {
                console.log(cliTable.toString());
            });
        }
    }
}

module.exports = new ResourceReportOption();
