const ProviderFactory = require('./src/network-providers/provider-factory');
const ContractFactory = require('./src/contract/contract-factory');

const AccountFactory = require('./src/account/normal-account/account-factory');
const MultiSignatureFactory = require('./src/account/multi-signature-account/multi-signature-factory');

const utils = require('./src/utils');

module.exports = (function () {

    let init = function (network = 'local') {
        const providerFactory = new ProviderFactory(network);
        const provider = providerFactory.instance;

        return build(provider);
    }

    let initFromProvider = function () {
        const availableProviders = {};

        const providersNames = Object.keys(ProviderFactory.providers());
        for (let index = 0; index < providersNames.length; index++) {
            const providerName = providersNames[index];

            availableProviders[providerName] = function (networkConfig) {
                const provider = ProviderFactory.providers()[providerName](networkConfig);
                return build(provider);
            }
        }

        return availableProviders;
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
        init: Object.assign(init, initFromProvider()),
        utils: utils,
        NETWORKS: ProviderFactory.availableNetworks()
    };
})();

