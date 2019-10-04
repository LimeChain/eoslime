const ContractFunction = require('./contract-function');
const defineImmutableProperties = require("./../helpers/immutable-properties").defineImmutableProperties;

class Contract {
    constructor(provider, abi, contractName, contractExecutorAccount) {
        defineImmutableProperties(this, [
            { name: "provider", value: provider },
            { name: "name", value: contractName },
            { name: "executor", value: contractExecutorAccount }
        ]);

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
    let contractActions = abi.actions;
    let contractStructs = Object.assign({}, ...abi.structs.map(struct => ({ [struct["name"]]: struct })));

    for (let i = 0; i < contractActions.length; i++) {
        let functionName = contractActions[i].name;

        this[functionName] = new ContractFunction(this, functionName, contractStructs);
        this[functionName].isTransactional = true;
    }
};

let declareTableGetters = function (abi) {
    const defaultParameters = { equal: null, lower: null, upper: null, index: 1, index_type: "i64", limit: 100 };
    let contractTables = abi.tables;

    for (let i = 0; i < contractTables.length; i++) {
        let tableName = contractTables[i].name;

        this[`get${tableName.charAt(0).toUpperCase() + tableName.slice(1)}`] = async function (params = defaultParameters) {
            const queryParams = Object.assign({}, defaultParameters, params);

            if (queryParams.equal) {
                queryParams.lower = queryParams.equal;
                queryParams.upper = queryParams.equal;
            }

            const result = await this.provider.eos.getTableRows({
                code: this.name,
                scope: this.name,
                table: tableName,
                key_type: queryParams.index_type,
                index_position: queryParams.index,
                lower_bound: queryParams.lower,
                upper_bound: queryParams.upper,
                json: true,
                limit: queryParams.limit
            });

            if (queryParams.limit == 1) {
                return result.rows[0];
            }

            return result.rows;
        };
    }
};
