const Account = require('./../account/account');

const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class Contract {

    constructor(eos, abi, contractName, contractExecutorAccount) {
        defineImmutableProperties(this, [
            { name: 'eosInstance', value: eos },
            { name: 'contractName', value: contractName },
            { name: 'defaultExecutor', value: contractExecutorAccount },
        ]);

        declareFunctionsFromABI.call(this, abi, eos);
    }
}

module.exports = Contract;


let declareFunctionsFromABI = function (abi, eos) {

    let contractFunctions = abi.structs;

    for (let i = 0; i < contractFunctions.length; i++) {
        let contractFunction = contractFunctions[i];

        this[contractFunction.name] = async function (...params) {

            let functionParams = params.slice(0, contractFunction.fields.length);

            let optionalsPosition = contractFunction.fields.length;
            let optionals = params[optionalsPosition] instanceof Object ? params[optionalsPosition] : null;

            let authorizationAccount;
            if (optionals && optionals.from instanceof Account) {
                authorizationAccount = optionals.from;
            } else {
                authorizationAccount = this.defaultExecutor;
            }

            let formedParams = mapParamsToExpectedOnes(functionParams, contractFunction.fields);
            return executeForAccount(eos, this.contractName, contractFunction.name, formedParams, authorizationAccount);
        }
    }
}

let mapParamsToExpectedOnes = function (plainParams, expectedParams) {
    let formedParams = {};

    for (let i = 0; i < expectedParams.length; i++) {
        let expectedParam = expectedParams[i].name;
        formedParams[expectedParam] = plainParams[i];
    }

    return formedParams;
}

let executeForAccount = function (eos, contractName, actionName, data, authorizationAccount) {
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
        { broadcast: true, sign: true, keyProvider: authorizationAccount.privateKey }
    );
}
