const chalk = require('chalk');

module.exports = {
    'StartShaping': () => { console.log(chalk.magentaBright('===== Shaping of DApp has started... =====')); },
    'SuccessfulShaping': () => { console.log(chalk.greenBright(`===== Successful shaping of DApp =====`)); },
    'UnsuccessfulShaping': (error) => {
        console.log(chalk.redBright(`===== Unsuccessful shaping =====`));
        console.log(error);
    },
    'InvalidShapeName': (name) => { console.log(chalk.redBright(`===== Invalid shape name ${name} =====`)); },
    'SuccessfulInstallation': () => { console.log(chalk.greenBright('===== Successfully installed project modules =====')); },
    'UnsuccessfulInstallation': (error) => {
        console.log(chalk.redBright('===== Unsuccessful installation of project modules ====='));
        console.log(error);
    }
}