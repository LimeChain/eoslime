const config = require('../../nodeos_data/config.json');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../helpers/async-soft-exec');

const commandMessages = require('./messages');
const stopCommandDefinition = require('./definition');
const fileSystemUtil = require('../../../helpers/file-system-util');

// eoslime nodeos stop

class StopCommand extends Command {
    constructor() {
        super(stopCommandDefinition);
    }

    async execute(args) {
        try {
            commandMessages.StoppingNodeos();

            const nodeosPath = config.nodeosPath;
            const nodeosPidFile = nodeosPath + '/eosd.pid';

            if (fileSystemUtil.exists(nodeosPidFile)) {
                const nodeosPid = fileSystemUtil.readFile(nodeosPidFile);

                const asyncKillExec = new AsyncSoftExec(`kill ${nodeosPid}`);
                asyncKillExec.onError((error) => commandMessages.UnsuccessfulStopping(error));
                await asyncKillExec.exec();

                await cleanNodeosData(nodeosPath);
                commandMessages.SuccessfullyStopped();
                return true;
            }

            commandMessages.NoRunningNodeos();
        } catch (error) {
            commandMessages.UnsuccessfulStopping(error);
        }

        return true;
    }
}

const cleanNodeosData = async function (dirPath) {
    fileSystemUtil.rmFile(dirPath + '/eosd.pid');
    fileSystemUtil.rmFile(dirPath + '/nodeos.log');
    await fileSystemUtil.recursivelyDeleteDir(dirPath + '/data');
    await fileSystemUtil.recursivelyDeleteDir(dirPath + '/config');
}

module.exports = StopCommand;
