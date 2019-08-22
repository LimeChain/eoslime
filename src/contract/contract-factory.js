const Contract = require('./contract');
const is = require('./../helpers/is');
const Account = require('./../account/account');

const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class ContractFactory {

    constructor(provider) {
        defineImmutableProperties(this, [
            { name: 'provider', value: provider }
        ]);
    }

    buildExisting(abi, contractName, contractExecutorAccount = this.provider.defaultAccount) {
        is(contractExecutorAccount).instanceOf(Account);

        let contract = new Contract(this.provider, abi, contractName, contractExecutorAccount);
        return contract;
    }
}

module.exports = ContractFactory;
