const is = require('../../helpers/is');

const BosProvider = require('../bos-provider');
const MainProvider = require('../main-provider');
const KylinProvider = require('../kylin-provider');
const LocalProvider = require('../local-provider');
const JungleProvider = require('../jungle-provider');
const WorbliProvider = require('../worbli-provider');
const CustomProvider = require('../custom-provider');

const PROVIDERS = {
    bos: (networkConfig) => { return new BosProvider(networkConfig) },
    main: (networkConfig) => { return new MainProvider(networkConfig) },
    kylin: (networkConfig) => { return new KylinProvider(networkConfig) },
    local: (networkConfig) => { return new LocalProvider(networkConfig) },
    jungle: (networkConfig) => { return new JungleProvider(networkConfig) },
    worbli: (networkConfig) => { return new WorbliProvider(networkConfig) },
    custom: (networkConfig) => { return new CustomProvider(networkConfig) }
}

class BaseProviderFactory {

    constructor(provider, providerFactory) {
        this.__provider = provider;

        const providerProxyHandler = {
            get: (obj, value) => {
                if (this.__provider[value]) {
                    return this.__provider[value];
                }

                return this[value];
            },
            construct: (target, network) => {
                return new providerFactory(network);
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

module.exports = BaseProviderFactory;
