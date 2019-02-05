const path = require('path');

const contractFilesReader = require('./../helpers/contract-files-reader');
const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class EOSDeployer {

    constructor(eosInstance, contractFactory) {
        defineImmutableProperties(this, [
            {
                name: '__deploy',
                value: async function (wasmPath, abiPath, contractAccount) {
                    let abi = contractFilesReader.readABIFromFile(path.resolve(abiPath));
                    let wasm = contractFilesReader.readWASMFromFile(path.resolve(wasmPath));

                    try {
                        await eosInstance.setcode(contractAccount.name, 0, 0, wasm, { keyProvider: contractAccount.privateKey });
                        await eosInstance.setabi(contractAccount.name, abi, { keyProvider: contractAccount.privateKey });
                    } finally {
                        let contract = contractFactory.buildExisting(abi, contractAccount.name, contractAccount);
                        return contract;
                    }
                }
            }
        ]);
    }
}

module.exports = EOSDeployer;
