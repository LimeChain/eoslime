const fileSystemUtil = require('../../../../helpers/file-system-util');

const Option = require('../../../../option');

class PathOption extends Option {
    constructor() {
        super(
            'path',
            {
                "describe": "The path nodeos data will be stored",
                "type": "string"
            }
        );
    }

    async process(optionValue) {
        return optionValue;
    }
}

module.exports = new PathOption();
