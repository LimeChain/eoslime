const Option = require('../../../../option');

class PathOption extends Option {
    constructor() {
        super(
            'path',
            {
                "describe": "Path to node folder",
                "type": "string",
            }
        );
    }

    process() {
        
    }
}

module.exports = new PathOption();
