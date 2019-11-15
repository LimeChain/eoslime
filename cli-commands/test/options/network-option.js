const Option = require('./../../option');

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
        let provider;
        if (optionValue) {
            provider = new args.eoslime.Provider(optionValue);
        } else {
            provider = new args.eoslime.Provider('local');
        }

        args.eoslime.Provider.reset(provider);
    }
}

module.exports = new NetworkOption();
