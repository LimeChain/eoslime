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
        let nodeosDir;
        let nodeosPid;

        try {
            commandMessages.StoppingNodeos();

            const configJsonFile = path.join(__dirname, '../../config.json');
            
            if (fileSystemUtil.exists(configJsonFile)) {
                nodeosDir = require(configJsonFile).nodeos_dir;
                const nodeosPidFile = path.join(nodeosDir, 'eosd.pid');

                if (fileSystemUtil.exists(nodeosPidFile)) {
                    nodeosPid = fileSystemUtil.readFile(nodeosPidFile);
                }
            }

            if (nodeosPid) {
                await fileSystemUtil.recursivelyDeleteDir(nodeosDir, false);

                const asyncKillExec = new AsyncSoftExec(`kill ${nodeosPid}`);
                asyncKillExec.onError((error) => commandMessages.UnsuccessfulStopping(error));
                asyncKillExec.onSuccess(() => commandMessages.SuccessfullyStopped());

                await asyncKillExec.exec();
            } else {
                commandMessages.NoRunningNodeos();
            }
        } catch (error) {
            commandMessages.UnsuccessfulStopping(error);
        }

        return true;
    }
}

module.exports = StopCommand;
