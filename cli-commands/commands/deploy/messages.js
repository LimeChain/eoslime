const chalk = require('chalk');
const logger = require('../../common/logger');

module.exports = {
    'StartDeployment': () => { logger.info(chalk.magentaBright('===== Deployment has started... =====')); },
    'SuccessfulDeploymentOfScript': (script) => { logger.info(chalk.greenBright(`===== Successful deployment of ${script} =====`)); },
    'UnsuccessfulDeploymentOfScript': (script, error) => { logger.error(chalk.redBright(`===== Unsuccessful deployment of ${script} =====`), error); },
    'UnsuccessfulDeployment': (error) => { logger.error(chalk.redBright(`===== Unsuccessful deployment =====`), error); }
}