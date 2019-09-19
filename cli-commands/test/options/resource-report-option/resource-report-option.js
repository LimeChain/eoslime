const Option = require('../../../option');
const ReportTable = require('./report-table');

class ResourceReportOption extends Option {
    constructor() {
        super(
            'resource-report',
            {
                "describe": "Provides you RAM and Bandwidth report for a contract.",
                "type": "string",
                "default": "false"
            }
        );

        this.reportTable = new ReportTable();
    }


    // Todo: init eoslime for different networks
    // Todo: add network option
    // Todo: add aliases

    // Todo: implement Contract.deploy method - YUP
    // Todo: implement on('deploy') - YUP
    // Todo: Deprecate Deployers - YUP
    // Todo: add deployment cost - YUP

    process(optionValue, args) {
        if (optionValue != 'false') {
            const functionsResources = [];
            const deploymentsResources = [];


            fillDeploymentsResources(args.eoslime, deploymentsResources);
            fillFunctionsResources(args.eoslime, functionsResources);

            args.testFramework.on('allFinished', () => {
                this.reportTable.addSection(
                    'Deployment resources',
                    deploymentsResources
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

const fillDeploymentsResources = function (eoslime, deploymentsResources) {
    eoslime.Contract.on('deploy', (txReceipts, contract) => {
        const setCodeResources = extractResourcesCostsFromReceipt(txReceipts[0]);
        const setABIResources = extractResourcesCostsFromReceipt(txReceipts[1]);

        const cpuCost = setCodeResources.cpuCost + setABIResources.cpuCost;
        const netCost = setCodeResources.netCost + setABIResources.netCost;
        const ramCost = setCodeResources.ramCost + setABIResources.ramCost;

        deploymentsResources.push([
            contract.name,
            'deploy',
            `set code tx:\n${setCodeResources.txId}\n\nset abi tx:\n${setABIResources.txId}`,
            cpuCost,
            netCost,
            ramCost
        ]);
    });
}

const fillFunctionsResources = function (eoslime, functionsResources) {
    eoslime.Contract.on('init', (contract) => {
        for (const functionName in contract) {
            if (contract.hasOwnProperty(functionName)) {
                const contractFunction = contract[functionName];

                if (contractFunction.isTransactional) {
                    contractFunction.on('processed', (txReceipt) => {
                        const functionResources = extractResourcesCostsFromReceipt(txReceipt);

                        functionsResources.push([
                            contract.name,
                            functionName,
                            functionResources.txId,
                            functionResources.cpuCost,
                            functionResources.netCost,
                            functionResources.ramCost
                        ]);
                    });
                }
            }
        }
    });
}

const extractResourcesCostsFromReceipt = function (txReceipt) {
    const netCost = txReceipt.processed.receipt.cpu_usage_us;
    const cpuCost = txReceipt.processed.receipt.net_usage_words;
    const ramCost = calculateRam(txReceipt.processed.action_traces[0].account_ram_deltas);

    return {
        cpuCost,
        netCost,
        ramCost,
        txId: txReceipt.transaction_id
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
