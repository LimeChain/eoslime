const nodoesDataManager = require('../../specific/nodeos-data/data-manager');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../../helpers/async-soft-exec');

const MESSAGE_COMMAND = require('./messages').COMMAND;
const MESSAGE_LOGS = require('./messages').LOGS;
const logsCommandDefinition = require('./definition');

// eoslime nodeos show logs --lines

class LogsCommand extends Command {
    constructor () {
        super(logsCommandDefinition);
    }

    async execute (args) {
        if (!nodoesDataManager.nodeosIsRunning(nodoesDataManager.nodeosPath())) {
            MESSAGE_LOGS.Empty();
            return void 0;
        }

        try {
            const optionsResults = await super.processOptions(args);
            const nodeosLogFile = nodoesDataManager.nodeosPath() + '/nodeos.log';

            const asyncSoftExec = new AsyncSoftExec(`tail -n ${optionsResults.lines} ${nodeosLogFile}`);
            const logs = await asyncSoftExec.exec();

            MESSAGE_COMMAND.Success(logs);
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }
}

module.exports = LogsCommand;
