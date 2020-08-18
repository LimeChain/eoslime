const Option = require('../../option');
const eoslime = require('../../../../index');

class NetworkOption extends Option {
    constructor () {
        super(
            'network',
            {
                "alias": "n",
                "describe": "The blockchain network you are going to test on.\n \nNetwork name or in case of custom: \n\"eoslime deploy -n.url=\"custom url\" -n.chainId=\"custom chain id\"",
                "type": "string",
                "default": "local",
            }
        );
    }

    process (optionValue) {
        return eoslime.init(optionValue);
    }
}

module.exports = new NetworkOption();
