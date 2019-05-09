const BosProvider = require('./bos-provider')
const MainProvider = require('./main-provider')
const LocalProvider = require('./local-provider')
const JungleProvider = require('./jungle-provider')
const WorbliProvider = require('./worbli-provider')
const CustomProvider = require('./custom-provider')

const NETWORKS = {
    local: () => { return new LocalProvider() },
    jungle: () => { return new JungleProvider() },
    bos: () => { return new BosProvider() },
    worbli: () => { return new WorbliProvider() },
    main: () => { return new MainProvider() },
    custom: (networkConfig) => { return new CustomProvider(networkConfig) }
}

class Provider {
    constructor(network) {
        return NETWORKS[network]() || NETWORKS.custom(network);
    }
}

module.exports = Provider
