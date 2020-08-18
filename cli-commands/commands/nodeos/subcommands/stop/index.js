const fileSystemUtil = require('../../../../helpers/file-system-util');
const nodeosDataManager = require('../../specific/nodeos-data/data-manager');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../../helpers/async-soft-exec');

const MESSAGE_COMMAND = require('./messages').COMMAND;
const stopCommandDefinition = require('./definition');

// eoslime nodeos stop

class StopCommand extends Command {
    constructor () {
        super(stopCommandDefinition);
    }

    async execute (args) {
        try {
            MESSAGE_COMMAND.Start();

            if (nodeosDataManager.nodeosIsRunning(nodeosDataManager.nodeosPath())) {
                const nodeosPid = fileSystemUtil.readFile(
                    nodeosDataManager.nodeosPath() + '/eosd.pid'
                );
                const asyncKillExec = new AsyncSoftExec(`kill ${nodeosPid}`);
                await asyncKillExec.exec();
            }

            await clearNodeosData(nodeosDataManager.nodeosPath());

            MESSAGE_COMMAND.Success();
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }
}

const clearNodeosData = async function (dirPath) {
    fileSystemUtil.rmFile(dirPath + '/eosd.pid');
    fileSystemUtil.rmFile(dirPath + '/nodeos.log');
    await fileSystemUtil.recursivelyDeleteDir(dirPath + '/data');
    await fileSystemUtil.recursivelyDeleteDir(dirPath + '/config');
}

module.exports = StopCommand;
