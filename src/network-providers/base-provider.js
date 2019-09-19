const EOS = require('eosjs');
const Account = require('./../account/account');

const is = require('./../helpers/is');

class BaseProvider {

    constructor(networkConfig) {
        this.network = networkConfig
        this.eos = EOS({
            httpEndpoint: networkConfig.url,
            chainId: networkConfig.chainId,
        });

        let defaultAccount = '';
        Object.defineProperty(this, 'defaultAccount', {
            get: () => { return defaultAccount },
            set: (account) => {
                is(account).instanceOf(Account);
                defaultAccount = account;
            }
        })
    }

    reset(newProvider) {
        is(newProvider).instanceOf(BaseProvider);
        Object.assign(this, newProvider);
    }
}

module.exports = BaseProvider
