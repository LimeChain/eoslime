let LOCAL_DEFATULT_ACCOUNT = require('./../defaults/local-account-default');
const BaseProvider = require('./base-provider');

const LocalNetworkConfig = {
    name: 'local',
    url: 'http://127.0.0.1:8888',
    chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
}

class LocalProvider extends BaseProvider {
    constructor(networkConfig) {
        super(Object.assign({}, LocalNetworkConfig, networkConfig))
        this.defaultAccount = LOCAL_DEFATULT_ACCOUNT
        this.defaultAccount.provider = this;
    }
}

module.exports = LocalProvider
