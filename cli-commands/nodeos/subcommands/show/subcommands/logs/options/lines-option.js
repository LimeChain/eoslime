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

    async process(optionValue) {
        return optionValue ? optionValue : 10;
    }
}

module.exports = new LinesOption();
