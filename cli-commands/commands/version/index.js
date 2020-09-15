const Command = require('../command');

const logger = require('../../common/logger');
const packageJSON = require('../../../package.json');
const versionCommandDefinition = require('./definition');

// eoslime version

class VersionCommand extends Command {
    constructor () {
        super(versionCommandDefinition);
    }

    async execute (args) {
        logger.info(packageJSON.version);
    }
}

module.exports = VersionCommand;
