const Option = require('../../../../../../option');

const commandMessages = require('../messages');
const readLastLines = require('read-last-lines');

class LinesOption extends Option {
    constructor() {
        super(
            'lines',
            {
                "describe": "Number of lines to display",
                "type": "number"
            }
        );
    }

    async process(optionValue) {
        return optionValue ? optionValue : 10;
    }
}

module.exports = new LinesOption();
