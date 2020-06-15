const chalk = require('chalk');
const logger = require('../../../../common/logger');

module.exports = {
    'NodeosLogs': (logs) => { logger.info(chalk.magentaBright(`===== Nodeos logs ===== \n ${logs}`)); },
    'EmptyLogs': () => { logger.info(chalk.blueBright('===== Empty logs =====')); },
    'UnsuccessfulShowing': (error) => { logger.error(chalk.redBright(`===== Logs has not been shown =====`), error); }
}