const EOS = require('eosjs');
const TableReader = require('./../table-reader/table-reader');

const is = require('./../helpers/is');

class BaseProvider {

    constructor(networkConfig) {
        this.network = networkConfig
        this.eos = EOS({
            httpEndpoint: networkConfig.url,
            chainId: networkConfig.chainId,
        });

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
        const result = await this.eos.getAbi(contractName);
        return result.abi;
    }

    async getRawWASM (contractName) {
        const result = await this.eos.getRawCodeAndAbi(contractName);
        return result.wasm;
    }
}

module.exports = BaseProvider
