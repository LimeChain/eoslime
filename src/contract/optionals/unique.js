const uniqueOptional = async function(optionals, rawTransaction) {
    if (optionals && optionals.unique) {
        rawTransaction.actions.push({
            account: "eosio.null",
            name: "nonce",
            authorization: [rawTransaction.defaultExecutor.executiveAuthority],
            data: {
                value: `${Date.now()}`
            }
        });
    }
};

module.exports = uniqueOptional;
