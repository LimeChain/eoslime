const axios = require('axios');
const Option = require('../../option');

class VersionOption extends Option {
    constructor () {
        super(
            'version',
            {
                "describe": "EOSIO software version",
                "type": "string",
                "default": ""
            }
        );
    }

    async process (optionValue) {
        if (!optionValue) {
            const latest = await axios.get('https://api.github.com/repos/eosio/eos/releases/latest');
            optionValue = latest.data.tag_name.substring(1);
        }

        return optionValue;
    }
}

module.exports = new VersionOption();
