const nodoesDataManager = require('../../specific/nodeos-data/data-manager');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../../helpers/async-soft-exec');

const commandMessages = require('./messages');
const logsCommandDefinition = require('./definition');

// eoslime nodeos show logs --lines

class LogsCommand extends Command {
    constructor() {
        super(logsCommandDefinition);
    }

    async execute (args) {
        if (!nodoesDataManager.nodeosIsRunning(nodoesDataManager.nodeosPath())) {
            commandMessages.EmptyLogs();
            return true;
        }

        try {
            const optionsResults = await super.processOptions(args);
            const nodeosLogFile = nodoesDataManager.nodeosPath() + '/nodeos.log';

            const asyncSoftExec = new AsyncSoftExec(`tail -n ${optionsResults.lines} ${nodeosLogFile}`);
            asyncSoftExec.onSuccess((logs) => { commandMessages.NodeosLogs(logs); });
            await asyncSoftExec.exec();
        } catch (error) {
            commandMessages.UnsuccessfulShowing(error);
        }

        return true;
    }
}

module.exports = LogsCommand;
