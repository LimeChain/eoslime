const exec = require('child_process').exec;
const Command = require('../../../../../command');

const commandMessages = require('./messages');
const showCommandDefinition = require('./definition');

// eoslime nodeos show logs --path --lines

class LogsCommand extends Command {
    constructor() {
        super(showCommandDefinition);
    }

    async execute(args) {
        try {
            const optionsResults = await super.processOptions(args);
            await showLogs(optionsResults);
            return true;
        } catch (error) {
            commandMessages.UnsuccessfulShowing(error);
        }
        return false;
    }
}

const showLogs = async function (result) {
    exec(`tail -n ${result.lines} ${result.path}`, (error, stdout, stderr) => {
        if (error) {
            throw new Error(`Could not show logs, due to '${error}'`);
        }

        commandMessages.NodeosLogs(stdout);
    });
}

module.exports = LogsCommand;
