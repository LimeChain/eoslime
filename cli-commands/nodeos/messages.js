const chalk = require('chalk');

module.exports = {
    'StartProcessing': () => { console.log(chalk.magentaBright('===== Processing ... =====')); },
    'SuccessfulProcessing': () => { console.log(chalk.greenBright(`===== Successful processing =====`)); },
    'UnsuccessfulProcessing': (error) => {
        console.log(chalk.redBright(`===== Unsuccessful processing =====`));
        console.log(error);
    }
}