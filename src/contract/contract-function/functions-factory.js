const ContractFunction = require('./contract-function');

class FunctionsFactory {

    static createFunction (contract, functionName, functionFields) {
        const contractFunction = new ContractFunction(contract, functionName, functionFields);

        const proxyHandler = {
            get: (obj, value) => {
                if (!obj.hasOwnProperty(value)) {
                    return contractFunction[value];
                }
            }
        }

        const proxy = new Proxy(async function (...params) {
            return contractFunction.broadcast(...params);
        }, proxyHandler);

        return proxy;
    }
}

module.exports = FunctionsFactory
