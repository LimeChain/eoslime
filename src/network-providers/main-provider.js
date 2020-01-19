const BaseProvider = require('./base-provider');

const MainNetworkProvider = {
    name: 'main',
    url: 'https://eos.greymass.com',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
}


class MainProvider extends BaseProvider {
    constructor(networkConfig) {
        super(Object.assign({}, MainNetworkProvider, networkConfig))
    }
}

module.exports = MainProvider
