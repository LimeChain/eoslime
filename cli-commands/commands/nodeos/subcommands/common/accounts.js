const eoslime = require('../../../../../').init();

const preDefinedAccounts = [
    {
        "name": "eoslimedavid",
        "publicKey": "EOS7UyV15G2t47MqRm4WpUP6KTfy9sNU3HHGu9aAgR2A3ktxoBTLv",
        "privateKey": "5KS9t8LGsaQZxLP6Ln5WK6XwYU8M3AYHcfx1x6zoGmbs34vQsPT"
    },
    {
        "name": "eoslimekevin",
        "publicKey": "EOS6Zz4iPbjm6FNys1zUMaRE4zPXrHcX3SRG65YWneVbdXQTSiqDp",
        "privateKey": "5KieRy975NgHk5XQfn8r6o3pcqJDF2vpeV9bDiuB5uF4xKCTwRF"
    },
    {
        "name": "eoslimemarty",
        "publicKey": "EOS7FDeYdY3G8yMNxtrU8MSYnAJc3ZogYHgL7RG3rBf8ZDYA3xthi",
        "privateKey": "5JtbCXgK5NERDdFdrmxb8rpYMkoxVfSyH1sR6TYxHBG5zNLHfj5"
    }
]

module.exports = {
    accounts: () => {
        return preDefinedAccounts;
    },
    load: async () => {
        for (let i = 0; i < preDefinedAccounts.length; i++) {
            const account = preDefinedAccounts[i];
            await eoslime.Account.create(account.name, account.privateKey);
        }
    }
}