const EOSDeployer = require('./eos-deployer');
const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class AccountDeployer extends EOSDeployer {

    constructor(eos, contractFactory, defaultDeploymentAccount) {
        super(eos, contractFactory);

        defineImmutableProperties(this, [
            {
                name: 'deploy',
                value: async function (wasm, abi, contractAccount = defaultDeploymentAccount) {
                    return this.__deploy(wasm, abi, contractAccount);
                }
            }
        ]);
    }
}

module.exports = AccountDeployer;
