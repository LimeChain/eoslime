const chalk = require('chalk');

module.exports = {
    'Installation': () => { console.log(chalk.magentaBright('===== Installing eoslime... =====')); },
    'SuccessfulInstallation': () => { console.log(chalk.greenBright('===== Successfully installed =====')); },
    'UnsuccessfulInstallation': () => { console.log(chalk.redBright('===== Unsuccessful installation =====')); }
}