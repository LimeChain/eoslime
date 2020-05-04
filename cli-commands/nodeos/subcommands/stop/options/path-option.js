const Option = require('../../../../option');
const fileSystemUtil = require('../../../../helpers/file-system-util');

class PathOption extends Option {
    constructor() {
        super(
            'path',
            {
                "describe": "Path to node folder",
                "type": "string",
                "default": "."
            }
        );
    }

    process(optionValue) {
        fileSystemUtil.isDir(optionValue);
        return optionValue;
    }
}

module.exports = new PathOption();
