const config = require('../../nodeos_data/config.json');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../helpers/async-soft-exec');

const commandMessages = require('./messages');
const logsCommandDefinition = require('./definition');
const fileSystemUtil = require('../../../helpers/file-system-util');

// eoslime nodeos show logs --lines

class LogsCommand extends Command {
    constructor() {
        super(logsCommandDefinition);
    }

    async execute(args) {
        try {
            const optionsResults = await super.processOptions(args);

            const nodeosLogFile = config.nodeosPath + '/nodeos.log';

            if (fileSystemUtil.exists(nodeosLogFile)) {
                const asyncSoftExec = new AsyncSoftExec(`tail -n ${optionsResults.lines} ${nodeosLogFile}`);
                asyncSoftExec.onError((error) => { commandMessages.UnsuccessfulShowing(error); });
                asyncSoftExec.onSuccess((logs) => { commandMessages.NodeosLogs(logs); });
                
                await asyncSoftExec.exec();
            }
        } catch (error) {
            commandMessages.UnsuccessfulShowing(error);
        }
        
        return true;
    }
}

module.exports = LogsCommand;
