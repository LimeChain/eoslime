const chalk = require('chalk');
const logger = require('../../../../common/logger');

module.exports = {
    'StoppingNodeos': () => { logger.info(chalk.magentaBright('===== Stopping nodeos ... =====')); },
    'SuccessfullyStopped': () => { logger.info(chalk.greenBright(`===== Successfully stopped =====`)); },
    'UnsuccessfulStopping': (error) => { logger.error(chalk.redBright(`===== Nodeos has not been stopped =====`), error); }
}