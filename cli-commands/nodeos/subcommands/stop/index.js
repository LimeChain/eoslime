const axios = require('axios');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../helpers/async-soft-exec');

const commandMessages = require('./messages');
const stopCommandDefinition = require('./definition');

// eoslime nodeos stop --path --pid

class StopCommand extends Command {
    constructor() {
        super(stopCommandDefinition);
    }

    async execute(args) {
        try {
            commandMessages.StoppingNodeos();
            const optionsResults = await super.processOptions(args);
            await stopNodeos(optionsResults);
        } catch (error) {
            commandMessages.UnsuccessfulStopping(error);
        }
    }
}

const stopNodeos = async function (result) {
    const nodeosRunning = await isNodeosRunning();

    if (!nodeosRunning) {
        commandMessages.NoRunningNodeos();
    } else {
        await stopAndClean(result);
    }
}

const isNodeosRunning = async function () {
    try {
        let result = await axios.get('http://localhost:8888/v1/chain/get_info');

        if (result.status == 200) {
            return true;
        }
    } catch (error) {}
    
    return false;
}

const stopAndClean = async function (result) {
    const killCommand = result.pid ? `kill ${result.pid}` : `pkill nodeos`;

    const asyncKillExec = new AsyncSoftExec(killCommand);
    asyncKillExec.onError((error) => commandMessages.UnsuccessfulProcessTermination(error));
    asyncKillExec.onSuccess(() => commandMessages.SuccessfulProcessTermination());
    await asyncKillExec.exec();

    const asyncCleanExec = new AsyncSoftExec(`rm -rf ${result.path}/*`);
    asyncCleanExec.onError((error) => commandMessages.UnsuccessfulCleanUp(error));
    asyncCleanExec.onSuccess(() => commandMessages.SuccessfulCleanUp());
    await asyncCleanExec.exec();

    commandMessages.SuccessfulStopping();
}

module.exports = StopCommand;
