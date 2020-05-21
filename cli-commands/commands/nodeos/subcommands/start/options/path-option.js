const Option = require('../../../../option');

const nodeosDataManager = require('../../../specific/nodeos-data/data-manager');

class PathOption extends Option {
    constructor() {
        super(
            'path',
            {
                "describe": "The path nodeos data will be stored",
                "type": "string",
                "default": nodeosDataManager.defaultPath()
            }
        );
    }

    async process (optionValue) {
        return optionValue;
    }
}

module.exports = new PathOption();
