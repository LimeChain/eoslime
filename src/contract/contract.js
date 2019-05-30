const Account = require('./../account/account');

const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class Contract {

    constructor(provider, abi, contractName, contractExecutorAccount) {
        defineImmutableProperties(this, [
            { name: 'provider', value: provider },
            { name: 'name', value: contractName },
            { name: 'executor', value: contractExecutorAccount },
        ]);

        declareFunctionsFromABI.call(this, abi, provider.eos);
    }
}

module.exports = Contract;


let declareFunctionsFromABI = function (abi, eos) {

    let contractActions = abi.actions;
    let contractStructs = Object.assign({}, ...abi.structs.map(struct => ({ [struct['name']]: struct })));

    for (let i = 0; i < contractActions.length; i++) {
        let functionName = contractActions[i].name;

        this[functionName] = async function (...params) {

            let functionParamsCount = contractStructs[functionName].fields.length;
            let functionParams = params.slice(0, functionParamsCount);

            // Optionals starts from the last function parameter position
            let optionals = params[functionParamsCount] instanceof Object ? params[functionParamsCount] : null;

            let authorizationAccount;
            if (optionals && optionals.from instanceof Account) {
                authorizationAccount = optionals.from;
            } else {
                authorizationAccount = this.executor;
            }

            let structuredParams = structureParamsToExpectedLook(functionParams, contractStructs[functionName].fields);
            return executeFunction(eos, this.name, functionName, structuredParams, authorizationAccount);
        }
    }
}

let structureParamsToExpectedLook = function (params, expectedParamsLook) {
    let structuredParams = {};

    for (let i = 0; i < expectedParamsLook.length; i++) {
        let expectedParam = expectedParamsLook[i].name;
        structuredParams[expectedParam] = params[i];
    }

    return structuredParams;
}

let executeFunction = function (eos, contractName, actionName, data, authorizationAccount) {
    return eos.transaction(
        {
            actions: [
                {
                    account: contractName,
                    name: actionName,
                    authorization: [authorizationAccount.permissions.active],
                    data: data
                }
            ]
        },
        { broadcast: true, sign: true, keyProvider: authorizationAccount.keys['active']['private'] }
    );
}
