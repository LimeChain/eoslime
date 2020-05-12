const path = require('path');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../helpers/async-soft-exec');

const template = require('./template');

const commandMessages = require('./messages');
const startCommandDefinition = require('./definition');
const fileSystemUtil = require('../../../helpers/file-system-util');

const defaultNodeosDir = '/tmp/nodeos';
const configJsonFile = path.join(__dirname, '../../config.json');

// eoslime nodeos start --path

class StartCommand extends Command {
    constructor() {
        super(startCommandDefinition);
    }

    async execute(args) {
        let nodeosDir;

        try {
            commandMessages.StartingNodeos();

            const optionsResults = await super.processOptions(args);

            const configJsonFile = path.join(__dirname, '../../config.json');

            if (!fileSystemUtil.exists(configJsonFile)) {
                nodeosDir = optionsResults.path ? optionsResults.path : defaultNodeosDir;
            }
            else {
                nodeosDir = require(configJsonFile).nodeos_dir;

                if (fileSystemUtil.exists(path.join(nodeosDir, 'eosd.pid'))) {
                    commandMessages.NodeosAlreadyRunning();
                    return true;
                }

                nodeosDir = optionsResults.path ? optionsResults.path : nodeosDir;
            }

            createNodeosDir(nodeosDir);
            storeNodeosConfig({ nodeos_dir: nodeosDir });

            if (fileSystemUtil.exists(path.join(nodeosDir, 'eosd.pid'))) {
                commandMessages.NodeosAlreadyRunning();
                return true;
            }
    
            const asyncSoftExec = new AsyncSoftExec(template(nodeosDir));
            asyncSoftExec.onError((error) => { commandMessages.UnsuccessfulStarting(error); });
            asyncSoftExec.onSuccess(() => { commandMessages.SuccessfullyStarted(); });
            
            await asyncSoftExec.exec();
        } catch (error) {
            commandMessages.UnsuccessfulStarting(error);
        }

        return true;
    }
}

const createNodeosDir = function (dirPath) {
    fileSystemUtil.createDir(dirPath);
}

const storeNodeosConfig = function (config) {
    const configContent = JSON.stringify(config);
    fileSystemUtil.writeFile(configJsonFile, configContent);
}

module.exports = StartCommand;
