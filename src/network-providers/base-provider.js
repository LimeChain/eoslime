let LOCAL_DEFATULT_ACCOUNT = require('./../defaults/local-account-default');
const { TextEncoder, TextDecoder } = require('util');
const { Api, JsonRpc, Serialize } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const TableReader = require('./../table-reader/table-reader');
const fetch = require('node-fetch');

const is = require('./../helpers/is');

class BaseProvider {

    constructor(networkConfig) {
        this.network = networkConfig
        this.eos = new JsonRpc(networkConfig.url, { fetch })
        //TODO validate chainId
        // this.eos = EOS({
        //     httpEndpoint: networkConfig.url,
        //     chainId: networkConfig.chainId,
        // });

        let defaultAccount = '';
        Object.defineProperty(this, 'defaultAccount', {
            get: () => { return defaultAccount },
            set: (account) => {
                is(account).instanceOf('BaseAccount');
                defaultAccount = account;
            }
        })
    }

    select (table) {
        const tableReader = new TableReader(this.eos);
        return tableReader.select(table);
    }

    async getABI (contractName) {
        const result = await this.eos.get_abi(contractName);
        return result.abi;
    }

    async getRawWASM (contractName) {
        const result = await this.eos.get_raw_code_and_abi(contractName);
        return result.wasm;
    }

    async sendTransaction({ privateKey, actions, txOptions = {} }) {
        const api = await this.createApiForPrivKey(privateKey);
        await api.transact({ actions }, { blocksBehind: 3, expireSeconds: 90, ...txOptions })
    }

    async createApiForPrivKey(privateKey) {
        const signatureProvider = new JsSignatureProvider([privateKey]);
        return new Api({ rpc: this.eos, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    }

    async setCode({ contractAccount, wasm }) {
        const actions = [
            {
                account: 'eosio',
                name: 'setcode',
                authorization: [contractAccount.authority],
                data: {
                    account: contractAccount.name,
                    code: wasm.toString('hex'),
                    vmtype: 0,
                    vmversion: 0
                }
            }
        ]
        await this.sendTransaction({ privateKey: contractAccount.privateKey, actions })
    }

    async setAbi({ contractAccount, abi }) {
        const actions = [
            {
                account: 'eosio',
                name: 'setabi',
                authorization: [contractAccount.authority],
                data: {
                    account: contractAccount.name,
                    abi: await this.serializeAbi(abi)
                }
            }
        ]
        await this.sendTransaction({ privateKey: contractAccount.privateKey, actions })
    }

    async serializeAbi(abiObj) {
        const api = await this.createApiForPrivKey(LOCAL_DEFATULT_ACCOUNT.privateKey);
        const buffer = new Serialize.SerialBuffer({
            textEncoder: api.textEncoder,
            textDecoder: api.textDecoder,
        });
        const abiDefinitions = api.abiTypes.get('abi_def');
        const abiJSON = abiDefinitions.fields.reduce(
            (acc, { name: fieldName }) =>
            Object.assign(acc, { [fieldName]: acc[fieldName] || [] }),
            abiObj
        );
        abiDefinitions.serialize(buffer, abiJSON);
        return Buffer.from(buffer.asUint8Array()).toString('hex');
    }
}

module.exports = BaseProvider
