const BosProvider = require('./bos-provider')
const MainProvider = require('./main-provider')
const LocalProvider = require('./local-provider')
const JungleProvider = require('./jungle-provider')
const KylinProvider = require('./kylin-provider')
const WorbliProvider = require('./worbli-provider')
const CustomProvider = require('./custom-provider')

const NETWORKS = {
    local: () => { return new LocalProvider() },
    jungle: () => { return new JungleProvider() },
    kylin: () => { return new KylinProvider() },
    bos: () => { return new BosProvider() },
    worbli: () => { return new WorbliProvider() },
    main: () => { return new MainProvider() },
    custom: (networkConfig) => { return new CustomProvider(networkConfig) }
}

class Provider {
    constructor(network) {
        if (NETWORKS[network]) {
            return NETWORKS[network]()
        }

        return NETWORKS.custom(network);
    }
}

module.exports = Provider
