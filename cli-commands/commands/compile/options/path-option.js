const fileSystemUtil = require('../../../helpers/file-system-util');

const Option = require('../../option');

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

    async process (optionValue) {
        if (fileSystemUtil.isDir(optionValue)) {
            const dirFiles = await fileSystemUtil.recursivelyReadDir(optionValue);
            const contractsFiles = dirFiles.filter(dirFile => dirFile.fileName.endsWith('.cpp'));
            // Return the contracts file names without the .cpp extension
            return contractsFiles.map((contractFile) => {
                return {
                    fullPath: contractFile.fullPath,
                    fileName: contractFile.fileName.slice(0, -4)
                }
            });
        }

        return optionValue.endsWith('.cpp') ? [`${__dirname}/${optionValue}`] : [];
    }
}

module.exports = new PathOption();
