const Option = require('./../../option');
const Provider = require('./../../../src/network-providers/provider');

class NetworkOption extends Option {
    constructor() {
        super(
            'network',
            {
                "describe": "The blockchain network you are going to deploy on",
                "type": "network name or in case of custom { url: custom url, chainId: custom chain id }",
                "default": "local",
                "choices": Provider.availableNetworks().all
            }
        );
    }

    process(network) {
        return new Provider(network);
    }
}

module.exports = new NetworkOption();
