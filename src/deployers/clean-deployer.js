const EOSDeployer = require('./eos-deployer');
const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class CleanDeployer extends EOSDeployer {

    constructor(eos, contractFactory, accountsLoader) {
        super(eos, contractFactory);
        defineImmutableProperties(this, [
            {
                name: 'deploy',
                value: async function (wasm, abi) {
                    let newContractAccount = (await accountsLoader.load())[0];
                    return this.__deploy(wasm, abi, newContractAccount);;
                }
            }
        ]);
    }
}

module.exports = CleanDeployer;
