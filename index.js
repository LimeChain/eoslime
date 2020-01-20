const ContractFactory = require('./src/contract/contract-factory');
const ProviderFactory = require('./src/network-providers/provider-factory');

const AccountFactory = require('./src/account/normal-account/account-factory');
const MultiSignatureFactory = require('./src/account/multi-signature-account/multi-signature-factory');

const utils = require('./src/utils');

module.exports = (function () {

    let init = function (network = 'local', config) {
        const providerFactory = new ProviderFactory(network, config);
        const provider = providerFactory.instance;

        const contractFactory = new ContractFactory(provider);

        const accountFactory = new AccountFactory(provider);
        const multiSignatureFactory = new MultiSignatureFactory(provider);

        return {
            utils: utils,
            Provider: provider,
            Contract: contractFactory,
            Account: accountFactory,
            MultiSigAccount: multiSignatureFactory,
        };
    }

    return {
        init: init,
        utils: utils,
        NETWORKS: ProviderFactory.availableNetworks()
    };
})();
