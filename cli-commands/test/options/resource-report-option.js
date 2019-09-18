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
                for (const functionName in contract) {
                    if (contract.hasOwnProperty(functionName)) {
                        const contractFunction = contract[functionName];

                        if (contractFunction.isTransactional) {
                            contractFunction.on('processed', (txReceipt) => {
                                cliTable.push({
                                    contract: contract.name,
                                    method: functionName,
                                    txReceipt: txReceipt
                                })
                            });
                        }
                    }
                }
            });

            testFramework.on('allFinished', () => {
                console.log(cliTable.toString());
            });
        }
    }
}

module.exports = new ResourceReportOption();
