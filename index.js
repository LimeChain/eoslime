const Provider = require('./src/network-providers/provider');

const AccountFactory = require('./src/account/account-factory');
const ContractFactory = require('./src/contract/contract-factory');

module.exports = (function () {

    let init = function (network = 'local') {
        let provider = new Provider(network)

        const accountFactory = new AccountFactory(provider);
        const contractFactory = new ContractFactory(provider);

        return {
            Provider: provider,
            Account: accountFactory,
            Contract: contractFactory
        };
    }

    return {
        init: init,
        NETWORKS: Provider.availableNetworks().all
    };
})();

