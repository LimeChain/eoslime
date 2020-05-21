const Command = require('../../../command');
const AsyncSoftExec = require('../../../../helpers/async-soft-exec');

const commandMessages = require('./messages');
const startCommandDefinition = require('./definition');

const template = require('./specific/template');

const predefinedAccounts = require('../common/accounts');
const nodeosDataManager = require('../../specific/nodeos-data/data-manager');

// eoslime nodeos start --path

class StartCommand extends Command {
    constructor() {
        super(startCommandDefinition);
    }

    async execute (args) {
        if (nodeosDataManager.nodeosIsRunning(nodeosDataManager.nodeosPath())) {
            commandMessages.NodeosAlreadyRunning();
            return true;
        }

        try {
            commandMessages.StartingNodeos();
            const optionsResults = await super.processOptions(args);

            nodeosDataManager.setNodeosPath(optionsResults.path);

            const asyncSoftExec = new AsyncSoftExec(template.build(optionsResults.path));
            await asyncSoftExec.exec();

            nodeosDataManager.requireRunningNodeos(optionsResults.path);
            await predefinedAccounts.load();

            commandMessages.SuccessfullyStarted();
        } catch (error) {
            commandMessages.UnsuccessfulStarting(error);
        }

        return true;
    }
}

module.exports = StartCommand;
