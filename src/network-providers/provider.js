const is = require('../helpers/is');
const BaseProvider = require('./base-provider');

const BosProvider = require('./bos-provider');
const MainProvider = require('./main-provider');
const KylinProvider = require('./kylin-provider');
const LocalProvider = require('./local-provider');
const JungleProvider = require('./jungle-provider');
const WorbliProvider = require('./worbli-provider');
const CustomProvider = require('./custom-provider');

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
        this.__provider = constructProvider(network);

        const providerProxyHandler = {
            get: (obj, value) => {
                if (this.__provider[value]) {
                    return this.__provider[value];
                }

                return this[value];
            },
            construct: (target, network) => {
                return constructProvider(network);
            }
        }

        this.instance = new Proxy(class ProviderInstance { }, providerProxyHandler);
    }

    reset(newProvider) {
        is(newProvider).instanceOf(BaseProvider);
        Object.assign(this.__provider, newProvider);
    }

    static availableNetworks() {
        const networks = {};
        Object.keys(NETWORKS).forEach(networkName => {
            networks[networkName.toUpperCase] = networkName;
        });

        networks.all = Object.keys(NETWORKS);
        return networks;
    }
}

const constructProvider = function (network) {
    if (NETWORKS[network]) {
        return NETWORKS[network]();
    }

    return NETWORKS.custom(network);
}

module.exports = Provider;
