const Option = require('../../option');
const repositories = require('./../repositories.json');

class FrameworkOption extends Option {
    constructor() {
        super(
            'framework',
            {
                "describe": "The name of the framework that the project will be build up.",
                "type": "string",
                "default": "react"
            }
        );
    }

    process(optionValue) {
        return repositories[optionValue];
    }
}

module.exports = new FrameworkOption();
