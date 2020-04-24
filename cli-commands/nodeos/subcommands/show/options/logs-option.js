const Option = require('../../../../option');

class LogsOption extends Option {
    constructor() {
        super(
            'logs',
            {
                "describe": "Lists last N lines from node logs",
                "type": "string",
            }
        );
    }

    process() {
        
    }
}

module.exports = new LogsOption();
