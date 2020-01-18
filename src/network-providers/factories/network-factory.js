const BaseProviderFactory = require('./base-factory');

class NetworkFactory extends BaseProviderFactory {

    constructor(network) {
        const providers = NetworkFactory.providers();
        if (providers[network]) {
            super(providers[network](), NetworkFactory);
        } else {
            super(providers.custom(network), NetworkFactory);
        }
    }
}

module.exports = NetworkFactory;
