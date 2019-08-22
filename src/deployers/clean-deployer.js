const EOSDeployer = require('./eos-deployer');

const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class CleanDeployer extends EOSDeployer {

    constructor(provider, contractFactory, accountFactory) {
        super(provider, contractFactory);
        defineImmutableProperties(this, [
            {
                name: 'deploy',
                value: async function (wasmPath, abiPath, options) {
                    let newContractAccount = await accountFactory.createRandom();
                    return this.__deploy(wasmPath, abiPath, newContractAccount, options);;
                }
            }
        ]);
    }
}

module.exports = CleanDeployer;
