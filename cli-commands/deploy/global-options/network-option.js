const Option = require('./../../option');
const Networks = require('./../../../src/helpers/networks.json');

class NetworkOption extends Option {
    constructor() {
        super(
            'network',
            {
                "describe": "The blockchain network you are going to deploy on",
                "type": "string",
                "default": "local",
                "choices": [
                    "local",
                    "jungle",
                    "bos",
                    "worbli",
                    "main"
                ]
            }
        );
    }

    execute(optionValue) {
        return Networks[optionValue];
    }
}

module.exports = new NetworkOption();
