const Option = require('../../../option');
const ReportTable = require('./report-table');

class ResourceReportOption extends Option {
    constructor () {
        super(
            'resource-report',
            {
                "alias": "report",
                "describe": "Provides you RAM and Bandwidth report for your tests",
                "type": "string",
                "default": "false"
            }
        );

        this.reportTable = new ReportTable();
    }

    process (optionValue, args) {
        if (optionValue != 'false') {
            const contractsResources = [];
            const deploymentsResources = [];

            fillDeploymentsResources(args.eoslime, deploymentsResources);
            fillFunctionsResources(args.eoslime, contractsResources);

            args.testFramework.on('allFinished', () => {
                this.reportTable.addSection(
                    'Deployment resources',
                    deploymentsResources
                );

                this.reportTable.addSection(
                    'Action resources'
                );

                for (const contractName in contractsResources) {
                    this.reportTable.addRow(['', contractName, '', '', '', '', '']);

                    const contractResources = contractsResources[contractName];
                    for (const functionName in contractResources.functions) {
                        const functionResources = contractResources.functions[functionName];
                        this.reportTable.addRow(
                            [
                                '',
                                '',
                                functionName,
                                `${functionResources.ram[0]} μs | ${functionResources.ram[1]} μs`,
                                `${functionResources.cpu[0]} Bytes | ${functionResources.cpu[1]} Bytes`,
                                `${functionResources.net[0]} Bytes | ${functionResources.net[1]} Bytes`,
                                functionResources.calls
                            ]
                        );
                    }
                }

                this.reportTable.draw();
            });
        }
    }
}

const fillDeploymentsResources = function (eoslime, deploymentsResources) {
    eoslime.Contract.on('deploy', (contract, txReceipts) => {
        const setCodeResources = extractResourcesCostsFromReceipt(txReceipts[0]);
        const setABIResources = extractResourcesCostsFromReceipt(txReceipts[1]);

        const cpuCost = setCodeResources.cpuCost + setABIResources.cpuCost;
        const netCost = setCodeResources.netCost + setABIResources.netCost;
        const ramCost = setCodeResources.ramCost + setABIResources.ramCost;

        deploymentsResources.push([
            contract.name,
            'deploy',
            `${cpuCost} μs`,
            `${netCost} Bytes`,
            `${ramCost} Bytes`,
            1
        ]);
    });
}

const fillFunctionsResources = function (eoslime, contractsResources) {
    eoslime.Contract.on('init', (contract) => {
        for (const functionName in contract.actions) {
            const contractFunction = contract.actions[functionName];
            contractFunction.on('processed', (txReceipt, inputParams) => {
                const usedResources = extractResourcesCostsFromReceipt(txReceipt);
                if (!contractsResources[contract.name]) {
                    contractsResources[contract.name] = {
                        functions: {}
                    }
                }

                if (!contractsResources[contract.name].functions[functionName]) {
                    contractsResources[contract.name].functions[functionName] = {
                        calls: 0,
                        ram: [],
                        cpu: [],
                        net: []
                    }
                }

                const functionResources = contractsResources[contract.name].functions[functionName];
                functionResources.ram = getMinMaxPair(functionResources.ram[0], functionResources.ram[1], usedResources.ramCost);
                functionResources.cpu = getMinMaxPair(functionResources.cpu[0], functionResources.cpu[1], usedResources.cpuCost);
                functionResources.net = getMinMaxPair(functionResources.net[0], functionResources.net[1], usedResources.netCost);
                functionResources.calls += 1;
            });
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
        ramCost
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

const getMinMaxPair = function (min, max, current) {
    if (!min || min > current) {
        min = current;
    }

    if (!max || max < current) {
        max = current;
    }

    return [min, max];
}

module.exports = new ResourceReportOption();
