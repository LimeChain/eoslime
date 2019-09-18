const path = require('path');
const Option = require('./../../option');

const fileSystemUtil = require('./../../utils/file-system-util');

class PathOption extends Option {
    constructor() {
        super(
            'path',
            {
                "describe": "Path to the testing file/folder",
                "type": "string",
                "default": "./tests/"
            }
        );
    }

    async process(optionValue) {
        let deploymentFilesFunctions = [];
        if (fileSystemUtil.isDir(optionValue)) {
            const dirFiles = await fileSystemUtil.recursivelyReadDir(optionValue);

            for (let i = 0; i < dirFiles.length; i++) {
                const dirFile = dirFiles[i];
                deploymentFilesFunctions.push(dirFile.fullPath);
            }
        }

        if (fileSystemUtil.isFile(optionValue)) {
            deploymentFilesFunctions.push(path.resolve('./', optionValue));
        }

        return deploymentFilesFunctions;
    }
}

module.exports = new PathOption();
