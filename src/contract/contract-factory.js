const Contract = require('./contract');
const Account = require('./../account/account');
const AccountFactory = require('./../account/account-factory');
const ContractDeployer = require('./contract-deployer');
// const EventClass = require('./../helpers/event-class');

const is = require('./../helpers/is');
const contractFilesReader = require('./..//helpers/contract-files-reader');

const EVENTS = {
    'init': 'init',
}

class ContractFactory extends ContractDeployer {

    constructor(provider) {
        super(provider);
        Object.assign(this.events, EVENTS);
    }

    at(abi, contractName, contractExecutorAccount = this.provider.defaultAccount) {
        is(contractExecutorAccount).instanceOf(Account);

        let abiInterface = abi;
        if (contractFilesReader.doesAbiExists(abi)) {
            abiInterface = contractFilesReader.readABIFromFile(abi);
        }

        let contract = new Contract(this.provider, abiInterface, contractName, contractExecutorAccount);
        this.emit(EVENTS.init, contract);

        return contract;
    }

    async deploy(wasmPath, abiPath, options) {
        const accountFactory = new AccountFactory(this.provider);
        const newContractAccount = await accountFactory.createRandom();

        return super.deployOnAccount(wasmPath, abiPath, newContractAccount, options);
    }
}

module.exports = ContractFactory;
