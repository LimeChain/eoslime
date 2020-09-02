const Option = require('../../option');

class NetworkOption extends Option {
    constructor () {
        super(
            'network',
            {
                "alias": "n",
                "describe": "The blockchain network you are going to test on.\n \nNetwork name or in case of custom: \n\"eoslime test -n.url=\"custom url\" -n.chainId=\"custom chain id\"",
                "type": "object",
                "default": "local",
            }
        );
    }

    process (optionValue, args) {
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
