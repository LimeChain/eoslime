const Provider = require('./src/network-providers/provider');

const AccountFactory = require('./src/account/account-factory');
const ContractFactory = require('./src/contract/contract-factory');

const utils = require('./src/utils');

module.exports = (function () {

    const init = function (network = 'local') {
        const providerFactory = new Provider(network);
        const provider = providerFactory.instance;

        const accountFactory = new AccountFactory(provider);
        const contractFactory = new ContractFactory(provider);

        return {
            utils: utils,
            Provider: provider,
            Account: accountFactory,
            Contract: contractFactory
        };
    }

    return {
        init: init,
        utils: utils,
        NETWORKS: Provider.availableNetworks().all
    };
})();

