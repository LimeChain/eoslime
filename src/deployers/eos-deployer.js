const path = require('path');

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
                name: '__deploy',
                value: async function (wasmPath, abiPath, contractAccount, options = defaultDeployOptions) {
                    let abi = contractFilesReader.readABIFromFile(path.resolve(abiPath));
                    let wasm = contractFilesReader.readWASMFromFile(path.resolve(wasmPath));

                    await provider.eos.setcode(contractAccount.name, 0, 0, wasm, { keyProvider: contractAccount.privateKey });
                    await provider.eos.setabi(contractAccount.name, abi, { keyProvider: contractAccount.privateKey });

                    let contract = contractFactory.buildExisting(abi, contractAccount.name, contractAccount);

                    options = Object.assign(defaultDeployOptions, options);
                    await executeOptions(contract, options, this.__deploy.options);

                    return contract;
                }
            },
        ]);

        this.__deploy.options = deployOptionsActions;
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
