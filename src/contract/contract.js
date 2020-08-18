const is = require('./../helpers/is');
const FunctionsFactory = require('./contract-function/functions-factory');

class Contract {
    constructor (provider, abi, contractName, contractExecutorAccount) {
        this.abi = abi;
        this.name = contractName;
        this.provider = provider;
        this.executor = contractExecutorAccount;

        this.actions = {};
        this.tables = {};

        declareFunctionsFromABI.call(this, abi);
        declareTableGetters.call(this, abi);
    }

    async makeInline () {
        is(this.executor).instanceOf('BaseAccount', 'executor is missing');

        if (this.name != this.executor.name) {
            throw new Error("In order to make a contract inline one, the contract executor should be the account, on which the contract is deployed");
        }

        return this.executor.addPermission("eosio.code");
    }

    async getRawWASM () {
        const wasm = await this.provider.getRawWASM(this.name);
        return wasm;
    }
}

module.exports = Contract;

let declareFunctionsFromABI = function (abi) {
    const contractActions = abi.actions;
    const contractStructs = Object.assign({}, ...abi.structs.map(struct => ({ [struct["name"]]: struct })));

    for (let i = 0; i < contractActions.length; i++) {
        const functionName = contractActions[i].name;
        const functionType = contractActions[i].type;
        this.actions[functionName] = FunctionsFactory.createFunction(this, functionName, contractStructs[functionType].fields)
    }
};

let declareTableGetters = function (abi) {
    const contractTables = abi.tables;

    for (let i = 0; i < contractTables.length; i++) {
        const tableName = contractTables[i].name;
        this.tables[tableName] = new Proxy({}, {
            get: (target, name) => {
                return this.provider.select(tableName).from(this.name)[name];
            }
        });
    }
};
