const BaseProviderFactory = require('./base-factory');

class NetworkConfigFactory extends BaseProviderFactory {

    constructor(networkConfig) {
        const providers = NetworkConfigFactory.providers();
        if (providers[networkConfig.name]) {
            super(providers[networkConfig.name](networkConfig), NetworkConfigFactory);
        } else {
            super(providers.custom(network), NetworkConfigFactory);
        }
    }
}

module.exports = NetworkConfigFactory;
