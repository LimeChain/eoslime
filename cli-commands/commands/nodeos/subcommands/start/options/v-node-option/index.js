const nodeVersions = require('./node-versions');
const Option = require('../../../../../option');

class VNodeOption extends Option {
    constructor () {
        super(
            'v-node',
            {
                "describe": "The version of the nodeos software",
                "type": "string",
                "default": "default"
            }
        );
    }

    process (optionValue) {
        return nodeVersions[`v${optionValue.split('.').join('')}`] || nodeVersions.vdefault;
    }

}

module.exports = new VNodeOption();
