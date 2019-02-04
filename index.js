const path = require('path');

const Account = require('./src/account/account');
const ContractFactory = require('./src/contract/contract-factory');

const CleanDeployer = require('./src/deployers/clean-deployer');
const AccountDeployer = require('./src/deployers/account-deployer');

const EosInstance = require('./src/helpers/eos-instance');

const DEFAULT_ACCOUNT = require('./src/defaults/account-default').init(Account);

const utils = require('./src/utils');
const contractFilesReader = require('./src/helpers/contract-files-reader');

module.exports = (function () {

    let init = function (initAccount = DEFAULT_ACCOUNT) {

        if (!(initAccount instanceof Account)) {
            throw new Error('Invalid account');
        }

        let eosInstance = new EosInstance(initAccount.network, initAccount.privateKey);

        let contractFactory = new ContractFactory(eosInstance);

        let cleanDeployer = new CleanDeployer(eosInstance, contractFactory, initAccount);
        let accountDeployer = new AccountDeployer(eosInstance, contractFactory, initAccount);

        return {
            CleanDeployer: cleanDeployer,
            AccountDeployer: accountDeployer,
            Account: Account,
            Contract: function (abiPath, contractName, contractExecutorAccount = initAccount) {
                let abi = contractFilesReader.readABIFromFile(path.resolve(abiPath));
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
