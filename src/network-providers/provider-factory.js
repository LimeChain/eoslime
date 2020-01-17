const is = require('../helpers/is');

const BosProvider = require('./bos-provider');
const MainProvider = require('./main-provider');
const KylinProvider = require('./kylin-provider');
const LocalProvider = require('./local-provider');
const JungleProvider = require('./jungle-provider');
const WorbliProvider = require('./worbli-provider');
const CustomProvider = require('./custom-provider');

const PROVIDERS = {
    Bos: (networkConfig) => { return new BosProvider(networkConfig) },
    Main: (networkConfig) => { return new MainProvider(networkConfig) },
    Kylin: (networkConfig) => { return new KylinProvider(networkConfig) },
    Local: (networkConfig) => { return new LocalProvider(networkConfig) },
    Jungle: (networkConfig) => { return new JungleProvider(networkConfig) },
    Worbli: (networkConfig) => { return new WorbliProvider(networkConfig) },
    Custom: (networkConfig) => { return new CustomProvider(networkConfig) }
}

class ProviderFactory {

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
        is(newProvider).instanceOf('BaseProvider');
        Object.assign(this.__provider, newProvider);
    }

    static availableNetworks() {
        const networks = [];
        Object.keys(PROVIDERS).forEach(providerName => {
            networks.push(providerName.toLowerCase);
        });

        return networks;
    }

    static providers() {
        return PROVIDERS;
    }
}

const constructProvider = function (network) {
    let provider = `${network}`;
    provider = provider.charAt(0).toUpperCase() + provider.slice(1);

    if (PROVIDERS[provider]) {
        return PROVIDERS[provider]();
    }

    return PROVIDERS.Custom(provider);
}

module.exports = ProviderFactory;
