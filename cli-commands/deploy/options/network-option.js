const Option = require('./../../option');

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
                    "main"
                ]
            }
        );
    }

    execute(optionValue) { }
}

module.exports = new NetworkOption();
