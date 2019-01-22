const Contract = require('./contract');
const Account = require('./../account/account');

const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class ContractFactory {

    constructor(eos) {
        defineImmutableProperties(this, [
            { name: 'eos', value: eos }
        ]);
    }

    buildExisting(abi, contractName, contractExecutorAccount) {
        if (!(contractExecutorAccount instanceof Account)) {
            throw new Error('Invalid account');
        }

        let contract = new Contract(this.eos, abi, contractName, contractExecutorAccount);
        return contract;
    }
}

module.exports = ContractFactory;
