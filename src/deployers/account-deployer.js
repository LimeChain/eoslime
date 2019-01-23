const EOSDeployer = require('./eos-deployer');
const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class AccountDeployer extends EOSDeployer {

    constructor(eos, contractFactory, defaultDeploymentAccount) {
        super(eos, contractFactory);

        defineImmutableProperties(this, [
            {
                name: 'deploy',
                value: async function (wasmPath, abiPath, contractAccount = defaultDeploymentAccount) {
                    return this.__deploy(wasmPath, abiPath, contractAccount);
                }
            }
        ]);
    }
}

module.exports = AccountDeployer;
