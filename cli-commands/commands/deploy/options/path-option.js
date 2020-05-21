const path = require('path');
const Option = require('../../option');

const fileSystemUtil = require('../../../helpers/file-system-util');

class PathOption extends Option {
    constructor() {
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
        let deploymentFilesFunctions = [];
        if (fileSystemUtil.isDir(optionValue)) {
            const dirFiles = await fileSystemUtil.recursivelyReadDir(optionValue);

            for (let i = 0; i < dirFiles.length; i++) {
                const dirFile = dirFiles[i];
                deploymentFilesFunctions.push({
                    fileName: dirFile.fileName,
                    deploy: require(path.resolve('./', dirFile.fullPath))
                });
            }
        }

        if (fileSystemUtil.isFile(optionValue)) {
            deploymentFilesFunctions.push({
                fileName: optionValue,
                deploy: require(path.resolve('./', optionValue))
            });
        }

        return deploymentFilesFunctions;
    }
}

module.exports = new PathOption();
