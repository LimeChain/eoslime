const Account = require("../../account/account");

const fromOption = function(optionals, rawTransaction) {
    if (optionals && optionals.from instanceof Account) {
        rawTransaction.defaultExecutor = optionals.from;
        for (let i = 0; i < rawTransaction.actions.length; i++) {
            rawTransaction.actions[i].authorization = [rawTransaction.defaultExecutor.executiveAuthority];
        }
    }
};

module.exports = fromOption;
