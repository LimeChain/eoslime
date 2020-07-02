const chalk = require('chalk');
const logger = require('../../common/logger');

module.exports = {
    'Installation': () => { logger.info(chalk.magentaBright('===== Installing eoslime... =====')); },
    'SuccessfulInstallation': () => { logger.info(chalk.greenBright('===== Successfully installed =====')); },
    'UnsuccessfulInstallation': (error) => { logger.error(chalk.redBright('===== Unsuccessful installation ====='), error); }
}