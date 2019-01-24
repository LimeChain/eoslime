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

module.exports = (function () {

    const defaultInitObject = {
        network: DEFAULT_NETWORK.network,
        chainId: DEFAULT_NETWORK.chainId,
        defaultAccount: new Account(DEFAULT_ACCOUNT.name, DEFAULT_ACCOUNT.publicKey, DEFAULT_ACCOUNT.privateKey)
    }

    let init = function (initObject = defaultInitObject) {
        initObject = Object.assign({}, defaultInitObject, initObject);

        if (!(initObject.defaultAccount instanceof Account)) {
            throw new Error('Invalid account');
        }

        let eosInstance = new EosInstance(initObject.network, initObject.chainId, initObject.defaultAccount.privateKey);

        let contractFactory = new ContractFactory(eosInstance);
        let accountsLoader = new AccountsLoader(eosInstance, initObject.defaultAccount);

        let cleanDeployer = new CleanDeployer(eosInstance, contractFactory, accountsLoader);
        let accountDeployer = new AccountDeployer(eosInstance, contractFactory, initObject.defaultAccount);

        return {
            CleanDeployer: cleanDeployer,
            AccountDeployer: accountDeployer,
            Account: Account,
            AccountsLoader: accountsLoader,
            Contract: function (abiPath, contractName, contractExecutorAccount) {
                let abi = contractFilesReader.readABIFromFile(abiPath);
                return contractFactory.buildExisting(abi, contractName, contractExecutorAccount);
            },
            utils: utils
        };
    }

    return {
        init: init,
        Account: Account
    };
})();
