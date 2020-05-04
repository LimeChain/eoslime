const Option = require('../../../../option');

class PIDOption extends Option {
    constructor() {
        super(
            'pid',
            {
                "describe": "Process ID of running nodeos",
                "type": "number"
            }
        );
    }

    process(optionValue) {
        return optionValue;
    }
}

module.exports = new PIDOption();
