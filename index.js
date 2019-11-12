const Provider = require('./src/network-providers/provider');
const ContractFactory = require('./src/contract/contract-factory');

const AccountFactory = require('./src/account/normal-account/account-factory');
const MultiSignatureFactory = require('./src/account/multi-signature-account/multi-signature-factory');

const utils = require('./src/utils');

module.exports = (function () {

    const init = function (network = 'local') {
        const providerFactory = new Provider(network);
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
        NETWORKS: Provider.availableNetworks().all
    };
})();

