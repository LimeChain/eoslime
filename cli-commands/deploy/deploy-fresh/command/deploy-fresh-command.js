const path = require('path');
const eoslimeTool = require('./../../../../index');

const fileSystemUtil = require('./../../../utils/file-system-util');
const deployFreshCommandDefinition = require('./deploy-fresh-command-definition');

const Command = require('./../../command');

const CONTRACTS_FOLDER = './contracts/';

// eoslime deploy-fresh

class DeployFreshCommand extends Command {
    constructor() {
        super(deployFreshCommandDefinition.template, deployFreshCommandDefinition.description);
    }

    defineOptions(yargs) {
        super.defineOptions(yargs, deployFreshCommandDefinition.options);
    }

    async execute(args) {
        commandMessages.StartDeployment();

        super.__execute(args, deployFreshCommandDefinition.options, (option, executionResult) => {
            args[option.name] = executionResult;
        });

        let eoslime = eoslimeTool.init({ network: args.network.url, chainId: args.network.chainId, defaultAccount: args.account });
        await deployFreshContracts(eoslime);
    }
}

let deployFreshContracts = async function (eoslime) {

    let deployedContracts = {};
    fileSystemUtil.executeActionForEachFileInDir(CONTRACTS_FOLDER, async (contractFileName) => {
        let parsedContractFileName = path.parse(contractFileName);

        if (deployedContracts[parsedContractFileName.name]) {
            return void 0;
        }

        if (isDeployableContract(parsedContractFileName.name)) {
            let contract = await eoslime.CleanDeployer(`${CONTRACTS_FOLDER}${contractFileName}.wasm`, `${CONTRACTS_FOLDER}${parsedContractFileName.name}.abi`);
            deployedContracts[parsedContractFileName.name] = parsedContractFileName.name;

            commandMessages.DeployedByAccountOnNetwork(contract.defaultExecutor, contract.eosInstance.network);
        }
    });
}

let isDeployableContract = function (contractFileName) {
    return fileSystemUtil.exists(`${CONTRACTS_FOLDER}${contractFileName}.wasm`) && fileSystemUtil.exists(`${CONTRACTS_FOLDER}${contractFileName}.abi`);
}

module.exports = new DeployFreshCommand();
