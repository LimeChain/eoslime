const is = require('./../helpers/is');
const contractFilesReader = require('./../helpers/contract-files-reader');

const EventClass = require('./../helpers/event-class');

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

class ContractDeployer extends EventClass {

    constructor(provider) {
        super(EVENTS);
        this.provider = provider;
    }

    async deployOnAccount(wasmPath, abiPath, contractAccount, options = defaultDeployOptions) {
        is(contractAccount).instanceOf('BaseAccount');

        const abi = contractFilesReader.readABIFromFile(abiPath);
        const wasm = contractFilesReader.readWASMFromFile(wasmPath);

        const setCodeTxReceipt = await this.provider.eos.setcode(contractAccount.name, 0, 0, wasm, { keyProvider: contractAccount.privateKey });
        const setAbiTxReceipt = await this.provider.eos.setabi(contractAccount.name, abi, { keyProvider: contractAccount.privateKey });

        const contract = this.fromFile(abi, contractAccount.name, contractAccount);

        options = Object.assign(defaultDeployOptions, options);
        await executeOptions(contract, options);

        this.emit(EVENTS.deploy, [setCodeTxReceipt, setAbiTxReceipt], contract);

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

module.exports = ContractDeployer;
