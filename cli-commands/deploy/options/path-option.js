const Option = require('./../../option');


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

    execute(optionValue) { }
}

module.exports = new PathOption();
