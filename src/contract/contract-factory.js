const Contract = require('./contract');
const Account = require('./../account/account');
const AccountFactory = require('./../account/account-factory');
const Deployer = require('./../deployers/eos-deployer');
const EventClass = require('./../helpers/event-class');

const is = require('./../helpers/is');
const contractFilesReader = require('./..//helpers/contract-files-reader');
const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

const EVENTS = {
    'init': 'init',
    'deploy': 'deploy'
}

class ContractFactory extends EventClass {

    constructor(provider) {
        super(EVENTS);

        defineImmutableProperties(this, [
            { name: 'provider', value: provider }
        ]);
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

        return deploy.call(this, wasmPath, abiPath, newContractAccount, options);
    }

    async deployWithAccount(wasmPath, abiPath, contractAccount, options) {
        is(contractAccount).instanceOf(Account);
        return deploy.call(this, wasmPath, abiPath, contractAccount, options);
    }
}

const deploy = async function (wasmPath, abiPath, contractAccount, options) {
    const deployer = new Deployer(this.provider, this);
    const deploymentData = await deployer.deploy(wasmPath, abiPath, contractAccount, options);

    this.emit(EVENTS.deploy, deploymentData.txReceipts, deploymentData.contract);

    return deploymentData.contract
}

module.exports = ContractFactory;
