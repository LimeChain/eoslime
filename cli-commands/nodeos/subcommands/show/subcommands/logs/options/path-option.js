const Option = require('../../../../../../option');
const fileSystemUtil = require('../../../..../../../../../helpers/file-system-util');

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
        const filePath = `${optionValue}/nodeos.log`;
        
        fileSystemUtil.isDir(optionValue);
        fileSystemUtil.isFile(filePath);

        return filePath;
    }
}

module.exports = new PathOption();
