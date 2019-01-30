const chalk = require('chalk');

module.exports = {
    'StartDeployment': () => { console.log(chalk.magentaBright('===== Deployment has started... =====')); },
    'FinishDeployment': () => { console.log(chalk.greenBright('===== Deployment has finished successfully =====')); }
}