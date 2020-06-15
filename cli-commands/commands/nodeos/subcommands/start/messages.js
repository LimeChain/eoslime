const chalk = require('chalk');
const logger = require('../../../../common/logger');

module.exports = {
    'StartingNodeos': () => { logger.info(chalk.magentaBright('===== Starting nodeos ... =====')); },
    'NodeosAlreadyRunning': () => { logger.info(chalk.blueBright(`===== Nodeos is already running =====`)); },
    'SuccessfullyStarted': () => { logger.info(chalk.greenBright(`===== Successfully started =====`)); },
    'UnsuccessfulStarting': (error) => { logger.error(chalk.redBright(`===== Nodeos has not been started =====`), error); }
}