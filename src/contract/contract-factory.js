const Account = require('./../account/account');
const Contract = require('./contract');
const EventClass = require('./../helpers/event-class');

const is = require('./../helpers/is');
const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

const EVENTS = {
    'init': 'init'
}

class ContractFactory extends EventClass {

    constructor(provider) {
        super(EVENTS);

        defineImmutableProperties(this, [
            { name: 'provider', value: provider }
        ]);
    }

    buildExisting(abi, contractName, contractExecutorAccount = this.provider.defaultAccount) {
        is(contractExecutorAccount).instanceOf(Account);

        let contract = new Contract(this.provider, abi, contractName, contractExecutorAccount);
        this.emit(EVENTS.init, contract);

        return contract;
    }
}

module.exports = ContractFactory;
