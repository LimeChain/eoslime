const FunctionsFactory = require('./contract-function/functions-factory');

class Contract {
    constructor(provider, abi, contractName, contractExecutorAccount) {
        this.name = contractName;
        this.provider = provider;
        this.executor = contractExecutorAccount;

        declareFunctionsFromABI.call(this, abi);
        declareTableGetters.call(this, abi);
    }

    async makeInline() {
        if (this.name != this.executor.name) {
            throw new Error("In order to make a contract inline one, the contract executor should be the account, on which the contract is deployed");
        }

        return this.executor.addPermission("eosio.code");
    }
}

module.exports = Contract;

let declareFunctionsFromABI = function (abi) {
    const contractActions = abi.actions;
    const contractStructs = Object.assign({}, ...abi.structs.map(struct => ({ [struct["name"]]: struct })));

    for (let i = 0; i < contractActions.length; i++) {
        const functionName = contractActions[i].name;
        this[functionName] = FunctionsFactory.createFunction(this, functionName, contractStructs)
    }
};

let declareTableGetters = function (abi) {
    const contractTables = abi.tables;

    for (let i = 0; i < contractTables.length; i++) {
        const tableName = contractTables[i].name;
        this[tableName] = new Proxy({}, {
            get: (target, name) => {
                return this.provider.select(tableName).from(this.name)[name];
            }
        });
    }
};
