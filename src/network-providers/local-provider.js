let LOCAL_DEFATULT_ACCOUNT = require('./../defaults/local-account-default');
const BaseProvider = require('./base-provider');

const LocalNetworkConfig = {
    name: 'local',
    url: 'http://127.0.0.1:8888',
    chainId: '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f'
}

class LocalProvider extends BaseProvider {
    constructor(networkConfig) {
        super(Object.assign({}, LocalNetworkConfig, networkConfig));
        this.defaultAccount = LOCAL_DEFATULT_ACCOUNT;
        this.defaultAccount.provider = this;
    }
}

module.exports = LocalProvider
