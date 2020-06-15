const chalk = require('chalk');
const logger = require('../../../../common/logger');

module.exports = {
    'PreloadedAccounts': () => { logger.info(chalk.magentaBright('===== Preloaded accounts =====')); },
    'UnsuccessfulShowing': (error) => { logger.error(chalk.redBright(`===== Accounts has not been shown =====`), error); }
}