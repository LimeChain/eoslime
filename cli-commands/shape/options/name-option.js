const Option = require('./../../option');
const repositories = require('./../repositories.json');

class NameOption extends Option {
    constructor() {
        super(
            'name',
            {
                "describe": "The name of the framework that the project will be build up.",
                "type": "string",
                "default": "react"
            }
        );
    }

    process(optionValue) {
        return {
            name: optionValue,
            repository: repositories[optionValue.toUpperCase()]
        }
    }
}

module.exports = new NameOption();
