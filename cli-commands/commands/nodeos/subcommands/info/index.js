const logger = require('../../../../common/logger');
const nodoesDataManager = require('../../specific/nodeos-data/data-manager');

const Command = require('../../../command');
const AsyncSoftExec = require('../../../../helpers/async-soft-exec');

const infoCommandDefinition = require('./definition');
const { log } = require('../../../../common/logger');

// eoslime nodeos info

class InfoCommand extends Command {
    constructor () {
        super(infoCommandDefinition);
    }

    async execute (args) {
        const versionCommand = new AsyncSoftExec('nodeos --version');

        const info = {
            version: (await versionCommand.exec()).replace(/(\r\n|\n|\r)/gm, ""),
            dataPath: nodoesDataManager.nodeosPath(),
            isRunning: nodoesDataManager.nodeosIsRunning(nodoesDataManager.nodeosPath())
        };

        logger.log(info, true);
    }
}

module.exports = InfoCommand;
