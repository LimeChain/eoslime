const Option = require('../../../../../../option');

class LinesOption extends Option {
    constructor() {
        super(
            'lines',
            {
                "describe": "Number of lines to display",
                "type": "number",
                "default": 10
            }
        );
    }

    process(optionValue) {
        return optionValue;
    }
}

module.exports = new LinesOption();
