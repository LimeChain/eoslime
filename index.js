const ContractFactory = require('./src/contract/contract-factory');
const NetworkProviderFactory = require('./src/network-providers/factories/network-factory');
const NetworkConfigProviderFactory = require('./src/network-providers/factories/network-config-factory');

const AccountFactory = require('./src/account/normal-account/account-factory');
const MultiSignatureFactory = require('./src/account/multi-signature-account/multi-signature-factory');

const utils = require('./src/utils');

module.exports = (function () {

    let init = function (network = 'local') {
        const providerFactory = new NetworkProviderFactory(network);
        return build(providerFactory.instance);
    }

    const providersNames = Object.keys(NetworkConfigProviderFactory.providers());
    for (let index = 0; index < providersNames.length; index++) {
        const providerName = providersNames[index];

        init[providerName] = function (networkConfig) {
            networkConfig.name = providerName;
            const providerFactory = new NetworkConfigProviderFactory(networkConfig);
            return build(providerFactory.instance);
        }
    }

    const build = function (provider) {
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
        NETWORKS: providersNames
    };
})();
