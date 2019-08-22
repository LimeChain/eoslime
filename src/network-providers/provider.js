const BosProvider = require('./bos-provider')
const MainProvider = require('./main-provider')
const KylinProvider = require('./kylin-provider')
const LocalProvider = require('./local-provider')
const JungleProvider = require('./jungle-provider')
const WorbliProvider = require('./worbli-provider')
const CustomProvider = require('./custom-provider')

const NETWORKS = {
    bos: () => { return new BosProvider() },
    main: () => { return new MainProvider() },
    kylin: () => { return new KylinProvider() },
    local: () => { return new LocalProvider() },
    jungle: () => { return new JungleProvider() },
    worbli: () => { return new WorbliProvider() },
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
