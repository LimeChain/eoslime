const Option = require('./../../option');
const eoslime = require('./../../../index');

class NetworkOption extends Option {
    constructor() {
        super(
            'network',
            {
                "describe": "The blockchain network you are going to deploy on.\n\nParameters: \nNetwork name or in case of custom: \n{ url: custom url, chainId: custom chain id }\n",
                "type": "string",
                "default": "local",
            }
        );
    }

    process(optionValue) {
        if (optionValue) {
            return eoslime.init(optionValue);
        }
    }
}

module.exports = new NetworkOption();
