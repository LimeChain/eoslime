const exec = require('child_process').exec;
const Option = require('../../../../option');
const optionMessages = require('../messages');

class LogsOption extends Option {
    constructor() {
        super(
            'logs',
            {
                "describe": "Lists last N lines from node logs",
                "type": "number",
            }
        );
    }

    process(optionValue) {
        optionMessages.NodeosLogs();

        const numLines = optionValue > 0 ? optionValue : 10;

        exec(`tail -n ${numLines} nodeos.log`, (error, stdout, stderr) => {
            if (error) {
                throw new Error(`Could not show logs, due to '${error}'`);
            }

            console.log(stdout);
            console.error(stderr);
        });
    }
}

module.exports = new LogsOption();
