const chalk = require('chalk');
const logger = require('../../common/logger');

module.exports = {
    'StartTesting': () => { logger.info(chalk.magentaBright('===== Testing has started... =====')); },
    'SuccessfulTesting': () => { logger.info(chalk.greenBright(`===== Testing completed successfully =====`)); },
    'UnsuccessfulTesting': (error) => { logger.error(chalk.redBright(`===== Testing failed =====`), error); }
}