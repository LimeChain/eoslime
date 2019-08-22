const path = require('path');
const fileSystemUtil = require('./../../../utils/file-system-util');

const Option = require('./../../../option');

class PathOption extends Option {

    constructor() {
        super(
            'path',
            {
                "describe": "Path to the contract/s file/folder",
                "type": "string",
                "default": "./contracts/"
            }
        );
    }

    process(optionValue) {
        if (fileSystemUtil.isDir(optionValue)) {
            return fileSystemUtil.recursivelyReadDir(optionValue);
        }

        return [`${__dirname}/${optionValue}`];
    }
}

module.exports = new PathOption();
