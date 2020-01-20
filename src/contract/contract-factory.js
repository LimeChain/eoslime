const Contract = require('./contract');
const AccountFactory = require('../account/normal-account/account-factory');

const ContractDeployer = require('./contract-deployer');

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

    fromFile(abi, contractName, contractExecutorAccount = this.provider.defaultAccount) {
        let abiInterface = abi;
        if (contractFilesReader.doesAbiExists(abi)) {
            abiInterface = contractFilesReader.readABIFromFile(abi);
        }

        const contract = new Contract(this.provider, abiInterface, contractName, contractExecutorAccount);
        this.emit(EVENTS.init, contract);

        return contract;
    }

    async at(contractName, contractExecutorAccount = this.provider.defaultAccount) {
        const abiInterface = (await this.provider.eos.getAbi(contractName)).abi;
        const contract = new Contract(this.provider, abiInterface, contractName, contractExecutorAccount);

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
