const chalk = require('chalk');

module.exports = {
    'Installation': () => { console.log(chalk.magentaBright('===== Installing eoslime... =====')); },
    'SuccessfulInstallation': () => { console.log(chalk.greenBright('===== Successfully installed =====')); },
    'UnsuccessfulInstallation': (error) => {
        console.log(chalk.redBright('===== Unsuccessful installation ====='));
        console.log(error);
    }
}