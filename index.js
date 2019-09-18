const path = require('path');

const Provider = require('./src/network-providers/provider');

const AccountFactory = require('./src/account/account-factory');
const ContractFactory = require('./src/contract/contract-factory');

const CleanDeployer = require('./src/deployers/clean-deployer');
const AccountDeployer = require('./src/deployers/account-deployer');

const contractFilesReader = require('./src/helpers/contract-files-reader');


module.exports = (function () {

    let init = function (network = 'local') {
        const provider = new Provider(network)

        const accountFactory = new AccountFactory(provider);
        const contractFactory = new ContractFactory(provider);

        const accountDeployer = new AccountDeployer(provider, contractFactory);
        const cleanDeployer = new CleanDeployer(provider, contractFactory, accountFactory);

        return {
            Provider: provider,
            Account: accountFactory,
            CleanDeployer: cleanDeployer,
            AccountDeployer: accountDeployer,
            Contract: buildContract(contractFactory)
        };
    }

    return {
        init: init,
        NETWORKS: Provider.availableNetworks
    };
})();

const buildContract = function (contractFactory) {
    const buildFromABIPath = function (abiPath, contractName, contractExecutorAccount) {
        let abi = contractFilesReader.readABIFromFile(path.resolve(abiPath));
        return contractFactory.buildExisting(abi, contractName, contractExecutorAccount);
    }

    buildFromABIPath.on = function (eventName, callback) {
        contractFactory.on(eventName, callback)
    }

    return buildFromABIPath;
}
