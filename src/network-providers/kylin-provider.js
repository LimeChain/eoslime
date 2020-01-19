
const BaseProvider = require('./base-provider');

const KylinNetworkConfig = {
    name: 'kylin',
    url: 'https://kylin.eoscanada.com',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'
}

class KylinProvider extends BaseProvider {
    constructor(networkConfig) {
        super(Object.assign({}, KylinNetworkConfig, networkConfig))
    }
}

module.exports = KylinProvider