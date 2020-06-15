const chalk = require('chalk');
const logger = require('../../common/logger');

module.exports = {
    'StartShaping': () => { logger.info(chalk.magentaBright('===== Shaping of DApp has started... =====')); },
    'SuccessfulShaping': () => { logger.info(chalk.greenBright(`===== Successful shaping =====`)); },
    'UnsuccessfulShaping': (error) => { logger.error(chalk.redBright(`===== Unsuccessful shaping =====`), error); },
    'InvalidShapeName': (name) => { logger.info(chalk.redBright(`===== Invalid shape name ${name} =====`)); },
}