const Command = require('../../../../../command');
const readLastLines = require('read-last-lines');

const commandMessages = require('./messages');
const showCommandDefinition = require('./definition');

const fileSystemUtil = require('../../../..../../../../helpers/file-system-util');

// eoslime nodeos show logs --path --lines

class LogsCommand extends Command {
    constructor() {
        super(showCommandDefinition);
    }

    async execute(args) {
        try {
            const optionsResults = await super.processOptions(args);
            await showLogs(optionsResults);
        } catch (error) {
            commandMessages.UnsuccessfulShowing(error);
        }
    }
}

const showLogs = async function(result) {
    const filePath = `${result.path}/nodeos.log`;
    fileSystemUtil.isFile(filePath);
    let logs = await readLastLines.read(filePath, result.lines);
    commandMessages.NodeosLogs(logs);
}

module.exports = LogsCommand;
