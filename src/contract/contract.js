const optionalsFunctions = require("./optionals");
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

        this[functionName] = async function (...params) {
            let functionParamsCount = contractStructs[functionName].fields.length;
            let functionParams = params.slice(0, functionParamsCount);
            let structuredParams = structureParamsToExpectedLook(functionParams, contractStructs[functionName].fields);
            let functionTx = buildMainFunctionTx(this.name, functionName, structuredParams, this.executor);

            // Optionals starts from the last function parameter position
            let optionals = params[functionParamsCount] instanceof Object ? params[functionParamsCount] : null;
            for (let i = 0; i < optionalsFunctions.all.length; i++) {
                const optionalFunction = optionalsFunctions.all[i];
                await optionalFunction(optionals, functionTx);
            }

            return executeFunction(this.provider.eos, functionTx);
        };
    }
};

let buildMainFunctionTx = function (contractName, actionName, data, authorizationAccount) {
    return {
        defaultExecutor: authorizationAccount,
        actions: [
            {
                account: contractName,
                name: actionName,
                authorization: [authorizationAccount.executiveAuthority],
                data: data
            }
        ]
    };
};

let structureParamsToExpectedLook = function (params, expectedParamsLook) {
    let structuredParams = {};

    for (let i = 0; i < expectedParamsLook.length; i++) {
        let expectedParam = expectedParamsLook[i].name;
        structuredParams[expectedParam] = params[i];
    }

    return structuredParams;
};

let executeFunction = function (eos, functionRawTx) {
    return eos.transaction(
        {
            actions: functionRawTx.actions
        },
        { broadcast: true, sign: true, keyProvider: functionRawTx.defaultExecutor.privateKey }
    );
};

let declareTableGetters = function (abi) {
    const defaultParameters = { equal: null, lower: null, upper: null, index: 1, index_type: "i64", limit: 100 };
    let contractTables = abi.tables;

    for (let i = 0; i < contractTables.length; i++) {
        let tableName = contractTables[i].name;

        this[tableName] = async function (params = defaultParameters) {
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
