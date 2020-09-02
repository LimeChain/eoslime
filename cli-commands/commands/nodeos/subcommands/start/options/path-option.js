const Option = require('../../../../option');

const fileSystemUtils = require('../../../../../helpers/file-system-util');
const nodeosDataManager = require('../../../specific/nodeos-data/data-manager');

class PathOption extends Option {
    constructor () {
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
        if (fileSystemUtils.isDir(optionValue)) {
            return optionValue;
        }
    }
}

module.exports = new PathOption();
