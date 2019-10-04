const contractFilesReader = require('./../helpers/contract-files-reader');
const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

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

class EOSDeployer {

    constructor(provider, contractFactory) {
        defineImmutableProperties(this, [
            {
                name: 'deploy',
                value: async function (wasmPath, abiPath, contractAccount, options = defaultDeployOptions) {
                    let abi = contractFilesReader.readABIFromFile(abiPath);
                    let wasm = contractFilesReader.readWASMFromFile(wasmPath);

                    const setCodeTxReceipt = await provider.eos.setcode(contractAccount.name, 0, 0, wasm, { keyProvider: contractAccount.privateKey });
                    const setAbiTxReceipt = await provider.eos.setabi(contractAccount.name, abi, { keyProvider: contractAccount.privateKey });

                    let contract = contractFactory.at(abi, contractAccount.name, contractAccount);

                    options = Object.assign(defaultDeployOptions, options);
                    await executeOptions(contract, options, this.deploy.options);

                    return {
                        contract,
                        txReceipts: [setCodeTxReceipt, setAbiTxReceipt]
                    };
                }
            },
        ]);

        this.deploy.options = deployOptionsActions;
    }
}


const executeOptions = async function (contract, options, optionsActions) {
    const optionsKeys = Object.keys(options);
    for (let i = 0; i < optionsKeys.length; i++) {
        const optionKey = optionsKeys[i];

        if (optionsActions[optionKey]) {
            await optionsActions[optionKey](contract, options[optionKey]);
        }
    }
}

module.exports = EOSDeployer;
