const path = require('path');

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

            const configJsonFile = path.join(__dirname, '../../config.json');
            
            if (fileSystemUtil.exists(configJsonFile)) {
                const nodeosDir = require(configJsonFile).nodeos_dir;
                const nodeosPidFile = path.join(nodeosDir, 'eosd.pid');

                if (fileSystemUtil.exists(nodeosPidFile)) {
                    const nodeosPid = fileSystemUtil.readFile(nodeosPidFile);

                    fileSystemUtil.rmFile(configJsonFile);
                    await fileSystemUtil.recursivelyDeleteDir(nodeosDir);

                    const asyncKillExec = new AsyncSoftExec(`kill ${nodeosPid}`);
                    asyncKillExec.onError((error) => commandMessages.UnsuccessfulStopping(error));
                    asyncKillExec.onSuccess(() => commandMessages.SuccessfullyStopped());

                    await asyncKillExec.exec();
                    return true;
                }
            }

            commandMessages.NoRunningNodeos();
        } catch (error) {
            commandMessages.UnsuccessfulStopping(error);
        }

        return true;
    }
}

module.exports = StopCommand;
