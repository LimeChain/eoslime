const chalk = require('chalk');

module.exports = {
    'StartShaping': () => { console.log(chalk.magentaBright('===== Shaping of DApp has started... =====')); },
    'SuccessfulShaping': () => { console.log(chalk.greenBright(`===== Successful shaping =====`)); },
    'UnsuccessfulShaping': (error) => {
        console.log(chalk.redBright(`===== Unsuccessful shaping =====`));
        console.log(error);
    },
    'InvalidShapeName': (name) => { console.log(chalk.redBright(`===== Invalid shape name ${name} =====`)); },
}