const axios = require('axios');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../helpers/async-soft-exec');

const commandMessages = require('./messages');
const commandExpression = require('./settings').command;
const startCommandDefinition = require('./definition');

// eoslime nodeos start --path

class StartCommand extends Command {
    constructor() {
        super(startCommandDefinition);
    }

    async execute(args) {
        try {
            commandMessages.StartingNodeos();
            const optionsResults = await super.processOptions(args);
            await startNodeos(optionsResults.path);
        } catch (error) {
            commandMessages.UnsuccessfulStarting(error);
        }
    }
}

const startNodeos = async function(folderPath) {
    const nodeosRunning = await isNodeosRunning();

    if (nodeosRunning) {
        commandMessages.NodeosAlreadyRunning();
    } else {
        await runNodeos(folderPath);
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

const runNodeos = async function (folderPath) {
    const expression = commandExpression.replace(new RegExp('{path}', 'g'), folderPath);

    const asyncSoftExec = new AsyncSoftExec(expression);
    asyncSoftExec.onError((error) => { commandMessages.UnsuccessfulStarting(error); });
    asyncSoftExec.onSuccess(() => { commandMessages.SuccessfulStarting(); });
    
    await asyncSoftExec.exec();
}

module.exports = StartCommand;
