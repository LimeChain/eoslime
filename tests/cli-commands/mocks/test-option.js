const Option = require('../../../cli-commands/commands/option');

class TestOption extends Option {
    constructor() {
        super(
            'test',
            {
                "describe": "Test option description",
                "type": "boolean"
            }
        );
    }

    process (optionValue) {
        return optionValue;
    }
}

module.exports = new TestOption();
