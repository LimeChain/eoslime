const uniqueOptional = function (optionals, rawTransaction) {
    if (optionals && optionals.unique) {
        rawTransaction.actions.push({
            account: "eosio.null",
            name: "nonce",
            authorization: [rawTransaction.defaultExecutor.authority],
            data: {
                value: `${Date.now()}`
            }
        });
    }
};

module.exports = uniqueOptional;
