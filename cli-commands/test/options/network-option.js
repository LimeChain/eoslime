const Option = require('./../../option');
const Provider = require('./../../../src/network-providers/provider');

class NetworkOption extends Option {
    constructor() {
        super(
            'network',
            {
                "describe": "The blockchain network you are going to test on.\n\nParameters: \nNetwork name or in case of custom: \n\"{ url: custom url, chainId: custom chain id }\"\n",
                "type": "object",
                "default": "local",
            }
        );
    }

    process(optionValue, args) {
        if (optionValue) {
            args.eoslime.Provider.reset(new Provider(optionValue));
        } else {
            args.eoslime.Provider.reset(new Provider('local'));
        }
    }
}

module.exports = new NetworkOption();
