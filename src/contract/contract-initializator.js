const Contract = require('./contract');

const is = require('../helpers/is');
const contractFilesReader = require('../helpers/contract-files-reader');

const EventClass = require('../helpers/event-class');
const EVENTS = {
    'init': 'init',
}

class ContractInitializator extends EventClass {

    constructor(provider) {
        super(EVENTS);
        this.provider = provider;
    }

    fromFile (abi, contractName, contractExecutorAccount = this.provider.defaultAccount) {
        is(contractExecutorAccount).instanceOf('BaseAccount');

        let abiInterface = abi;
        if (contractFilesReader.doesAbiExists(abi)) {
            abiInterface = contractFilesReader.readABIFromFile(abi);
        }

        const contract = new Contract(this.provider, abiInterface, contractName, contractExecutorAccount);
        this.emit(EVENTS.init, contract);

        return contract;
    }

    async at (contractName, contractExecutorAccount = this.provider.defaultAccount) {
        is(contractExecutorAccount).instanceOf('BaseAccount');

        const abiInterface = (await this.provider.eos.getAbi(contractName)).abi;
        const contract = new Contract(this.provider, abiInterface, contractName, contractExecutorAccount);

        this.emit(EVENTS.init, contract);
        return contract;
    }
}

module.exports = ContractInitializator;
