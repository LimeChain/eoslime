const path = require('path');
const config = require('../../nodeos_data/config.json');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../helpers/async-soft-exec');

const template = require('./template');

const commandMessages = require('./messages');
const startCommandDefinition = require('./definition');
const fileSystemUtil = require('../../../helpers/file-system-util');

const defaultPath = path.join(__dirname, '../../nodeos_data');

// eoslime nodeos start --path

class StartCommand extends Command {
    constructor() {
        super(startCommandDefinition);
    }

    async execute(args) {
        let nodeosPath;

        try {
            commandMessages.StartingNodeos();

            const optionsResults = await super.processOptions(args);

            if (!config.nodeosPath) {
                nodeosPath = optionsResults.path ? optionsResults.path : defaultPath;
            } else {
                checkForNodeos(config.NODEOS_DIR);
                nodeosPath = optionsResults.path ? optionsResults.path : config.nodeosPath;
            }

            checkForNodeos(nodeosPath);
            storeNodeosConfig(nodeosPath);
    
            const asyncSoftExec = new AsyncSoftExec(template.build(nodeosPath));
            asyncSoftExec.onError((error) => { commandMessages.UnsuccessfulStarting(error); });
            await asyncSoftExec.exec();

            if (fileSystemUtil.exists(nodeosPath + '/eosd.pid')) {
                commandMessages.SuccessfullyStarted();
            } else {
                commandMessages.UnsuccessfulStarting('Pid file has not been created');
            }
        } catch (error) {
            commandMessages.UnsuccessfulStarting(error);
        }

        return true;
    }
}

const checkForNodeos = function (dirPath) {
    if (fileSystemUtil.exists(dirPath + '/eosd.pid')) {
        throw new Error('Nodeos is already running');
    }
}

const storeNodeosConfig = function (dirPath) {
    const configContent = JSON.stringify({ nodeosPath: dirPath });
    fileSystemUtil.writeFile(`${defaultPath}/config.json`, configContent);
}

module.exports = StartCommand;
