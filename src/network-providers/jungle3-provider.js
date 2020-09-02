const BaseProvider = require('./base-provider');

const Jungle3NetworkConfig = {
    name: 'jungle3',
    url: 'https://jungle3.cryptolions.io',
    chainId: '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840'
}

class Jungle3Provider extends BaseProvider {
    constructor(networkConfig) {
        super(Object.assign({}, Jungle3NetworkConfig, networkConfig))
    }
}

module.exports = Jungle3Provider
