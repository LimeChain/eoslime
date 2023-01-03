const is = require('../../helpers/is');
const EventClass = require('../../helpers/event-class');
const optionalsFunctions = require("./function-optionals");

const EVENTS = {
    'processed': 'processed'
}

class ContractFunction extends EventClass {

    constructor (contract, functionName, functionFields) {
        super(EVENTS);

        this.contract = contract;
        this.functionName = functionName;
        this.functionFields = functionFields;
    }

    async broadcast (params, options) {
        is(this.contract.executor).instanceOf('BaseAccount', 'executor is missing');

        const txOptions = {
            broadcast: true,
            sign: true
        }

        const txReceipt = await executeFunction.call(this, params, options, txOptions);

        this.emit(EVENTS.processed, txReceipt, params);
        return txReceipt;
    }

    async getRawTransaction (params, options) {
        const txOptions = {
            broadcast: false,
            sign: false
        }

        const rawTransaction = await executeFunction.call(this, params, options, txOptions);
        return rawTransaction.transaction.transaction;
    }

    async sign (params, options) {
        const txOptions = {
            broadcast: false,
            sign: true
        }

        const rawTransaction = await executeFunction.call(this, params, options, txOptions);
        return rawTransaction.transaction;
    }
}

async function executeFunction (params, fnOptions, txOptions) {
    const functionRawTxData = buildFunctionRawTxData.call(
        this,
        this.contract.executor,
        params,
        fnOptions
    );

    return this.contract.provider.sendTransaction({
        privateKey: functionRawTxData.defaultExecutor.privateKey,
        actions: functionRawTxData.actions,
        txOptions
    })

    // return this.contract.provider.eos.transaction(
    //     {
    //         actions: functionRawTxData.actions
    //     },
    //     { ...txOptions, keyProvider: functionRawTxData.defaultExecutor.privateKey }
    // );
};

function buildFunctionRawTxData (authorizer, params, options) {
    const structuredParams = structureParamsToExpectedLook(params, this.functionFields);
    const functionTx = buildMainFunctionTx(this.contract.name, this.functionName, structuredParams, authorizer);

    processOptions(options, functionTx);

    return functionTx;
}

function structureParamsToExpectedLook (params, expectedParamsLook) {
    let structuredParams = {};

    for (let i = 0; i < expectedParamsLook.length; i++) {
        let expectedParam = expectedParamsLook[i].name;
        structuredParams[expectedParam] = params[i];
    }

    return structuredParams;
};

function buildMainFunctionTx (contractName, actionName, data, authorizationAccount) {
    return {
        defaultExecutor: authorizationAccount,
        actions: [
            {
                account: contractName,
                name: actionName,
                authorization: [authorizationAccount.authority],
                data: data
            }
        ]
    };
};

function processOptions (options, functionRawTxData) {
    const optionals = options instanceof Object ? options : null;
    for (let i = 0; i < optionalsFunctions.all.length; i++) {
        const optionalFunction = optionalsFunctions.all[i];
        optionalFunction(optionals, functionRawTxData);
    }
}

module.exports = ContractFunction;
