const EventClass = require('./../../helpers/event-class');
const optionalsFunctions = require("./function-optionals");

const EVENTS = {
    'processed': 'processed'
}

class ContractFunction extends EventClass {
    constructor(contract, functionName, contractStructs) {
        super(EVENTS);

        const self = this;

        const contractFunction = async function (...params) {
            let functionParamsCount = contractStructs[functionName].fields.length;
            let functionParams = params.slice(0, functionParamsCount);
            let structuredParams = structureParamsToExpectedLook(functionParams, contractStructs[functionName].fields);
            let functionTx = buildMainFunctionTx(contract.name, functionName, structuredParams, contract.executor);

            // Optionals starts from the last function parameter position
            let optionals = params[functionParamsCount] instanceof Object ? params[functionParamsCount] : null;
            for (let i = 0; i < optionalsFunctions.all.length; i++) {
                const optionalFunction = optionalsFunctions.all[i];
                await optionalFunction(optionals, functionTx);
            }

            const txReceipt = await executeFunction(contract.provider.eos, functionTx);
            self.emit(EVENTS.processed, txReceipt);

            return txReceipt;
        };

        contractFunction.on = function (eventName, callback) {
            self.on(eventName, callback);
        }

        return contractFunction;
    }
}

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

module.exports = ContractFunction;
