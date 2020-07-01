const is = require('../../../helpers/is')

const fromOption = function (optionals, rawTransaction) {
    if (optionals && optionals.from && is(optionals.from).instanceOf('BaseAccount')) {
        rawTransaction.defaultExecutor = optionals.from;
        for (let i = 0; i < rawTransaction.actions.length; i++) {
            rawTransaction.actions[i].authorization = [rawTransaction.defaultExecutor.authority];
        }
    }
};

module.exports = fromOption;
