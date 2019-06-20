const path = require('path');

const contractFilesReader = require('./../helpers/contract-files-reader');
const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

const defaultOption = {
    inline: false
}

class EOSDeployer {

    constructor(provider, contractFactory) {
        defineImmutableProperties(this, [
            {
                name: '__deploy',
                value: async function (wasmPath, abiPath, contractAccount, options = defaultOption) {
                    let abi = contractFilesReader.readABIFromFile(path.resolve(abiPath));
                    let wasm = contractFilesReader.readWASMFromFile(path.resolve(wasmPath));

                    await provider.eos.setcode(contractAccount.name, 0, 0, wasm, { keyProvider: contractAccount.privateKey });
                    await provider.eos.setabi(contractAccount.name, abi, { keyProvider: contractAccount.privateKey });

                    let contract = contractFactory.buildExisting(abi, contractAccount.name, contractAccount);
                    await executeOptions(contract, options);

                    return contract;
                }
            }
        ]);
    }


}

const optionsActions = {
    inline: async (contract, inline) => {
        if (inline) {
            await contract.makeInline();
        }
    }
}

const executeOptions = async function (contract, options) {
    const optionsKeys = Object.keys(options);
    for (let i = 0; i < optionsKeys.length; i++) {
        const optionKey = optionsKeys[i];
        await optionsActions[optionKey](contract, options[optionKey]);
    }
}

module.exports = EOSDeployer;
