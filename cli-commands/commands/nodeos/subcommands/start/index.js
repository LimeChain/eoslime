const Command = require('../../../command');
const AsyncSoftExec = require('../../../../helpers/async-soft-exec');

const MESSAGE_COMMAND = require('./messages').COMMAND;
const MESSAGE_NODEOS = require('./messages').NODEOS;
const startCommandDefinition = require('./definition');

const predefinedAccounts = require('../common/accounts');
const nodeosDataManager = require('../../specific/nodeos-data/data-manager');

// eoslime nodeos start --path --v-node

class StartCommand extends Command {
    constructor () {
        super(startCommandDefinition);
    }

    async execute (args) {
        if (nodeosDataManager.nodeosIsRunning(nodeosDataManager.nodeosPath())) {
            MESSAGE_NODEOS.AlreadyRunning();
            return void 0;
        }

        try {
            MESSAGE_COMMAND.Start();

            const optionsResults = await super.processOptions(args);
            nodeosDataManager.setNodeosPath(optionsResults.path);

            const asyncSoftExec = new AsyncSoftExec(optionsResults['v-node'](optionsResults.path));
            await asyncSoftExec.exec();

            nodeosDataManager.requireRunningNodeos(optionsResults.path);
            await predefinedAccounts.load();

            MESSAGE_COMMAND.Success();
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }
}

module.exports = StartCommand;
