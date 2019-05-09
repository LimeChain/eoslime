const EOS = require('eosjs');

class BaseProvider {

    constructor(networkConfig) {
        this.network = networkConfig
        this.eos = EOS({
            httpEndpoint: networkConfig.url,
            chainId: networkConfig.chainId,
        });
    }

    setDefaultAccount(account) {
        // if (!(initAccount instanceof Account)) {
        //         throw new Error('Invalid account');
        //     }
        this.defaultAccount = account
    }
}

module.exports = BaseProvider
