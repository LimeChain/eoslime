const is = require('../helpers/is');
const contractFilesReader = require('../helpers/contract-files-reader');

const ContractInitializator = require('./contract-initializator');
const AccountFactory = require('../account/normal-account/account-factory');

const defaultDeployOptions = {
    inline: false
}

const deployOptionsActions = {
    inline: async (contract, inline) => {
        if (inline) {
            return contract.makeInline();
        }
    }
}

const EVENTS = {
    'deploy': 'deploy'
}

class ContractFactory extends ContractInitializator {

    constructor (provider) {
        super(provider);
        Object.assign(this.events, EVENTS);
    }

    async deploy (wasmPath, abiPath, options) {
        const accountFactory = new AccountFactory(this.provider);
        const newContractAccount = await accountFactory.createRandom();

        return this.deployOnAccount(wasmPath, abiPath, newContractAccount, options);
    }

    async deployOnAccount (wasmPath, abiPath, contractAccount, options = defaultDeployOptions) {
        const abi = contractFilesReader.readABIFromFile(abiPath);
        const wasm = contractFilesReader.readWASMFromFile(wasmPath);

        const contract = await this.__processDeployment(
            wasm,
            abi,
            contractAccount,
            options
        );

        return contract;
    }

    async deployRaw (wasm, abi, options) {
        const accountFactory = new AccountFactory(this.provider);
        const newContractAccount = await accountFactory.createRandom();

        return this.deployRawOnAccount(wasm, abi, newContractAccount, options);
    }

    async deployRawOnAccount (wasm, abi, contractAccount, options = defaultDeployOptions) {
        const contract = await this.__processDeployment(
            Buffer.from(wasm, 'base64'),
            abi,
            contractAccount,
            options
        );

        return contract;
    }

    async __processDeployment (wasm, abi, contractAccount, options = defaultDeployOptions) {
        is(contractAccount).instanceOf('BaseAccount');

        const setCodeTxReceipt = await this.provider.setCode({ contractAccount, wasm })
        const setAbiTxReceipt = await this.provider.setAbi({ contractAccount, abi });

        const contract = this.fromFile(abi, contractAccount.name, contractAccount);

        options = Object.assign(defaultDeployOptions, options);
        await executeOptions(contract, options);

        this.emit(EVENTS.deploy, contract, [setCodeTxReceipt, setAbiTxReceipt]);

        return contract;
    }
}

const executeOptions = async function (contract, options) {
    const optionsKeys = Object.keys(options);
    for (let i = 0; i < optionsKeys.length; i++) {
        const optionKey = optionsKeys[i];

        if (deployOptionsActions[optionKey]) {
            await deployOptionsActions[optionKey](contract, options[optionKey]);
        }
    }
}

module.exports = ContractFactory;
