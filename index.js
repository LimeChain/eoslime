const Account = require('./src/account/account');
const AccountsLoader = require('./src/account/accounts-loader');
const ContractFactory = require('./src/contract/contract-factory');

const CleanDeployer = require('./src/deployers/clean-deployer');
const AccountDeployer = require('./src/deployers/account-deployer');

const EosInstance = require('./src/helpers/eos-instance');

const DEFAULT_NETWORK = require('./src/defaults/network-default');
const DEFAULT_ACCOUNT = require('./src/defaults/account-default');

const utils = require('./src/utils');
const contractFilesReader = require('./src/helpers/contract-files-reader');


var eoslime = (function () {

    let init = function (network, chainId, defaultAccount) {
        network = network || DEFAULT_NETWORK.network;
        chainId = chainId || DEFAULT_NETWORK.chainId;
        defaultAccount = defaultAccount || new Account(DEFAULT_ACCOUNT.name, DEFAULT_ACCOUNT.publicKey, DEFAULT_ACCOUNT.privateKey);

        if (!(defaultAccount instanceof Account)) {
            throw new Error('Invalid account');
        }

        let eosInstance = new EosInstance(network, chainId, defaultAccount.privateKey);

        let contractFactory = new ContractFactory(eosInstance);
        let accountsLoader = new AccountsLoader(eosInstance, defaultAccount);

        let cleanDeployer = new CleanDeployer(eosInstance, contractFactory, accountsLoader);
        let accountDeployer = new AccountDeployer(eosInstance, contractFactory, defaultAccount);


        return {
            CleanDeployer: cleanDeployer,
            AccountDeployer: accountDeployer,
            Account: Account,
            AccountsLoader: accountsLoader,
            Contract: function (abiPath, contractName, contractExecutorAccount = defaultAccount) {
                let abi = contractFilesReader.readABIFromFile(abiPath);
                return contractFactory.buildExisting(abi, contractName, contractExecutorAccount);
            },
            utils: utils
        }
    }

    return {
        init: init
    }
})();

module.exports = eoslime;