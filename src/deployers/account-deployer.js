const EOSDeployer = require('./eos-deployer');
const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class AccountDeployer extends EOSDeployer {

    constructor(provider, contractFactory) {
        super(provider, contractFactory);

        defineImmutableProperties(this, [
            {
                name: 'deploy',
                value: async function (wasmPath, abiPath, contractAccount = provider.defaultAccount) {
                    return this.__deploy(wasmPath, abiPath, contractAccount);
                }
            }
        ]);
    }
}

module.exports = AccountDeployer;
