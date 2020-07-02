const chalk = require('chalk');
const logger = require('../../common/logger');

module.exports = {
    'StartCompilation': () => { logger.info(chalk.magentaBright('===== Compilation has started... =====')); },
    'UnsuccessfulCompilation': (error) => { logger.error(chalk.redBright(`===== Unsuccessful compilation =====`), error); },
    'SuccessfulCompilationOfContract': (contract) => { logger.info(chalk.greenBright(`===== Successfully compilation of ${contract} =====`)); },
    'UnsuccessfulCompilationOfContract': (error, file) => { logger.error(chalk.redBright(`===== Unsuccessful compilation of ${file} =====`), error); },
    'ContractNotExisting': () => { logger.info(chalk.redBright(`===== There is not a contract to compile =====`)); }
}