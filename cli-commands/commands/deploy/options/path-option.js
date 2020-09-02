const path = require('path');
const Option = require('../../option');

const fileSystemUtil = require('../../../helpers/file-system-util');

class PathOption extends Option {
    constructor () {
        super(
            'path',
            {
                "describe": "Path to the deployment file/folder",
                "type": "string",
                "default": "./deployment/"
            }
        );
    }

    async process (optionValue) {
        if (fileSystemUtil.isDir(optionValue)) {
            const deploymentFilesFunctions = [];
            const dirFiles = await fileSystemUtil.recursivelyReadDir(optionValue);

            for (let i = 0; i < dirFiles.length; i++) {
                const dirFile = dirFiles[i];
                deploymentFilesFunctions.push({
                    fileName: dirFile.fileName,
                    deploy: require(path.resolve('./', dirFile.fullPath))
                });
            }

            return deploymentFilesFunctions;
        }

        if (fileSystemUtil.isFile(optionValue)) {
            return [{
                fileName: optionValue,
                deploy: require(path.resolve('./', optionValue))
            }];
        }
    }
}

module.exports = new PathOption();
