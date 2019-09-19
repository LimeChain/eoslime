const Option = require('../../../option');
const ReportTable = require('./report-table');

class ResourceReportOption extends Option {
    constructor() {
        super(
            'resource-report',
            {
                "describe": "Provides you RAM and Bandwidth report for a contract. \n\nParameters: \nNetwork name or in case of custom: \n{ url: custom url, chainId: custom chain id }\n",
                "type": "string",
                "default": "false"
            }
        );

        this.reportTable = new ReportTable();
    }


    // Todo: init eoslime for different networks
    // Todo: add network option
    // Todo: implement Contract.deploy method
    // Todo: implement on('deploy')
    // Todo: Deprecate Deployers
    // Todo: add deployment cost
    // Todo: add aliases

    process(optionValue, args) {
        if (optionValue != 'false') {
            optionValue = optionValue || 'local';

            const functionsResources = [];
            // const contractsDeploymentsResources = [];

            args.eoslime.Contract.on('init', (contract) => {
                for (const functionName in contract) {
                    if (contract.hasOwnProperty(functionName)) {
                        const contractFunction = contract[functionName];

                        if (contractFunction.isTransactional) {
                            contractFunction.on('processed', (txReceipt) => {
                                const netCost = txReceipt.processed.receipt.cpu_usage_us;
                                const cpuCost = txReceipt.processed.receipt.net_usage_words;
                                const ramCost = calculateRam(txReceipt.processed.action_traces[0].account_ram_deltas);

                                functionsResources.push([
                                    contract.name,
                                    functionName,
                                    txReceipt.transaction_id,
                                    cpuCost,
                                    netCost,
                                    ramCost
                                ]);
                            });
                        }
                    }
                }
            });

            // args.eoslime.Contract.on('deploy', (contract) => {
            //     contractsDeploymentsResources.push(getReportData(contract));
            // });

            // this.reportTable.addSection(
            //     'Contract deployments resources',
            //     contractsDeploymentsResources
            // );



            args.testFramework.on('allFinished', () => {
                this.reportTable.addSection(
                    'Deployment resources',
                    []
                );

                this.reportTable.addSection(
                    'Action resources',
                    functionsResources
                );

                this.reportTable.draw();
            });
        }
    }
}

const calculateRam = function (actionRamDeltas) {
    let ramSum = 0;
    if (actionRamDeltas) {
        for (let i = 0; i < actionRamDeltas.length; i++) {
            const ramDelta = actionRamDeltas[i];
            ramSum += ramDelta.delta;
        }
    }

    return ramSum;
}

module.exports = new ResourceReportOption();
