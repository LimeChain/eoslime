const BaseProvider = require('./base-provider');

const WorbliNetworkProvider = {
    name: 'main',
    url: 'https://eos.greymass.com',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
}

class WorbliProvider extends BaseProvider {
    constructor() {
        super(Object.assign(WorbliNetworkProvider, networkConfig))
    }
}

module.exports = WorbliProvider
