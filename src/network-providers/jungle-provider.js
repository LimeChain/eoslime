const BaseProvider = require('./base-provider');

const JungleNetworkConfig = {
    name: 'jungle',
    url: 'https://jungle2.cryptolions.io',
    chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473'
}

class JungleProvider extends BaseProvider {
    constructor(networkConfig) {
        super(Object.assign(JungleNetworkConfig, networkConfig))
    }
}

module.exports = JungleProvider
