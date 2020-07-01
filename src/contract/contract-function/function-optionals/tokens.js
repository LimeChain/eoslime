const tokensOptional = function (optionals, rawTransaction) {
    if (optionals && optionals.tokens) {
        rawTransaction.actions.push({
            account: "eosio.token",
            name: "transfer",
            authorization: [rawTransaction.defaultExecutor.authority],
            data: {
                from: rawTransaction.defaultExecutor.name,
                to: rawTransaction.actions[0].account,
                quantity: optionals.tokens,
                memo: ""
            }
        });
    }
};

module.exports = tokensOptional;
