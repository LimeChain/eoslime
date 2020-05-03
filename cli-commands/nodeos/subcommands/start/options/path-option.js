const Option = require('../../../../option');
const fileSystemUtil = require('../../../../helpers/file-system-util');

class PathOption extends Option {
    constructor() {
        super(
            'path',
            {
                "describe": "Path to nodeos folder",
                "type": "string",
                "default": "."
            }
        );
    }

    async process(optionValue) {
        fileSystemUtil.isDir(optionValue);
        return optionValue;
    }
}

module.exports = new PathOption();
