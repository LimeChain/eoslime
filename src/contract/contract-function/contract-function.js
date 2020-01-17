const is = require('../../helpers/is');
const EventClass = require('../../helpers/event-class');
const optionalsFunctions = require("./function-optionals");

const EVENTS = {
    'processed': 'processed'
}

class ContractFunction extends EventClass {

    constructor(contract, functionName, functionFields) {
        super(EVENTS);
        this.contract = contract;
        this.functionName = functionName;
        this.functionFields = functionFields;
        this.isTransactional = true;
    }

    async broadcast(...params) {
        is(this.contract.executor).instanceOf('BaseAccount', 'executor is missing');

        const functionParamsCount = this.functionFields.length;
        const functionParams = params.slice(0, functionParamsCount);
        const functionRawTxData = buildFunctionRawTxData.call(this, this.contract.executor, functionParams);

        // Optionals starts from the last function parameter position
        const optionals = params[functionParamsCount] instanceof Object ? params[functionParamsCount] : null;
        for (let i = 0; i < optionalsFunctions.all.length; i++) {
            const optionalFunction = optionalsFunctions.all[i];
            optionalFunction(optionals, functionRawTxData);
        }

        const txReceipt = await executeFunction(
            this.contract.provider.eos,
            functionRawTxData,
            { broadcast: true, sign: true, keyProvider: functionRawTxData.defaultExecutor.privateKey }
        );

        this.emit(EVENTS.processed, txReceipt, functionParams);
        return txReceipt;
    }

    async getRawTransaction(...params) {
        const functionRawTxData = buildFunctionRawTxData.call(this, this.contract.executor, params);
        const rawTransaction = await executeFunction(
            this.contract.provider.eos,
            functionRawTxData,
            { broadcast: false, sign: false }
        );

        return rawTransaction.transaction.transaction;
    }

    async sign(signer, ...params) {
        is(signer).instanceOf('BaseAccount');

        const functionRawTxData = buildFunctionRawTxData.call(this, signer, params);
        const rawTransaction = await executeFunction(
            this.contract.provider.eos,
            functionRawTxData,
            { broadcast: false, sign: true, keyProvider: signer.privateKey }
        );

        return rawTransaction.transaction;
    }
}

const buildFunctionRawTxData = function (authorizer, params) {
    const structuredParams = structureParamsToExpectedLook(params, this.functionFields);
    const functionTx = buildMainFunctionTx(this.contract.name, this.functionName, structuredParams, authorizer);

    return functionTx;
}

const buildMainFunctionTx = function (contractName, actionName, data, authorizationAccount) {
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

const structureParamsToExpectedLook = function (params, expectedParamsLook) {
    let structuredParams = {};

    for (let i = 0; i < expectedParamsLook.length; i++) {
        let expectedParam = expectedParamsLook[i].name;
        structuredParams[expectedParam] = params[i];
    }

    return structuredParams;
};

const executeFunction = async function (eos, functionRawTx, options) {
    return eos.transaction(
        {
            actions: functionRawTx.actions
        },
        options
    );
};

module.exports = ContractFunction;
