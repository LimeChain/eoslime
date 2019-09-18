const Option = require('./../../option');
const eoslime = require('./../../../index');

class NetworkOption extends Option {
    constructor() {
        super(
            'network',
            {
                "describe": "The blockchain network you are going to deploy on",
                "type": "network name or in case of custom { url: custom url, chainId: custom chain id }",
                "default": "local",
                "choices": eoslime.NETWORKS
            }
        );
    }

    process(network) {
        return eoslime.init(network);
    }
}

module.exports = new NetworkOption();
