const BaseProvider = require('./base-provider');

const BosNetworkConfig = {
    name: 'bos',
    url: 'https://hapi.bos.eosrio.io',
    chainId: 'd5a3d18fbb3c084e3b1f3fa98c21014b5f3db536cc15d08f9f6479517c6a3d86'
}

class BosProvider extends BaseProvider {
    constructor(networkConfig) {
        super(Object.assign(BosNetworkConfig, networkConfig))
    }
}

module.exports = BosProvider
