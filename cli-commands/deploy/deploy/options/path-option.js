const Option = require('./../../option');


const fileSystemUtil = require('./../../utils/file-system-util');

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

    async execute(optionValue) {
        let deploymentFilesFunctions = [];

        if (fileSystemUtil.isDir(optionValue)) {
            fileSystemUtil.executeActionForEachFileInDir(optionValue, (filename) => {
                deploymentFilesFunctions.push(require(`${optionValue}${filename}`));
            });

            return deploymentFilesFunctions;
        }

        if (fileSystemUtil.isFile(optionValue)) {
            deploymentFilesFunctions.push(deploymentFile);
            return deploymentFilesFunctions;
        }
    }
}

module.exports = new PathOption();
