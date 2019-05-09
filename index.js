const path = require('path');

const Provider = require('./src/network-providers/provider');

const AccountFactory = require('./src/account/account-factory');
const ContractFactory = require('./src/contract/contract-factory');

const CleanDeployer = require('./src/deployers/clean-deployer');
const AccountDeployer = require('./src/deployers/account-deployer');

const utils = require('./src/utils');
const contractFilesReader = require('./src/helpers/contract-files-reader');


module.exports = (function () {

    let init = function (network = 'local') {
        let provider = new Provider(network)

        let accountFactory = new AccountFactory(provider);
        let contractFactory = new ContractFactory(provider);

        let accountDeployer = new AccountDeployer(provider, contractFactory);
        let cleanDeployer = new CleanDeployer(provider, contractFactory, accountFactory);

        return {
            Provider: provider,
            Account: accountFactory,
            CleanDeployer: cleanDeployer,
            AccountDeployer: accountDeployer,
            Contract: function (abiPath, contractName, contractExecutorAccount) {
                let abi = contractFilesReader.readABIFromFile(path.resolve(abiPath));
                return contractFactory.buildExisting(abi, contractName, contractExecutorAccount);
            },
            utils
        };
    }

    return {
        init: init
    };
})();
