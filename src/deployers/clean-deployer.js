const Account = require('./../account/account');
const EOSDeployer = require('./eos-deployer');

const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class CleanDeployer extends EOSDeployer {

    constructor(eosInstance, contractFactory, accountCreator) {
        super(eosInstance, contractFactory);
        defineImmutableProperties(this, [
            {
                name: 'deploy',
                value: async function (wasmPath, abiPath) {
                    let newContractAccount = await Account.createRandom(accountCreator, eosInstance.network.name);
                    return this.__deploy(wasmPath, abiPath, newContractAccount);;
                }
            }
        ]);
    }
}

module.exports = CleanDeployer;
