const eoslime = require('../../../../../').init();

const preDefinedAccounts = [
    {
        "name": "eoslimedavid",
        "publicKey": "EOS7UyV15G2t47MqRm4WpUP6KTfy9sNU3HHGu9aAgR2A3ktxoBTLv",
        "privateKey": "5KS9t8LGsaQZxLP6Ln5WK6XwYU8M3AYHcfx1x6zoGmbs34vQsPT"
    },
    {
        "name": "eoslimekevin",
        "publicKey": "EOS7UyV15G2t47MqRm4WpUP6KTfy9sNU3HHGu9aAgR2A3ktxoBTLv",
        "privateKey": "5KS9t8LGsaQZxLP6Ln5WK6XwYU8M3AYHcfx1x6zoGmbs34vQsPT"
    },
    {
        "name": "eoslimemarty",
        "publicKey": "EOS7UyV15G2t47MqRm4WpUP6KTfy9sNU3HHGu9aAgR2A3ktxoBTLv",
        "privateKey": "5KS9t8LGsaQZxLP6Ln5WK6XwYU8M3AYHcfx1x6zoGmbs34vQsPT"
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