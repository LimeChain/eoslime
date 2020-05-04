const chalk = require('chalk');

module.exports = {
    'StartingNodeos': () => { console.log(chalk.magentaBright('===== Starting nodeos ... =====')); },
    'NodeosAlreadyRunning': () => { console.log(chalk.redBright(`===== Nodeos is already running =====`)); },
    'SuccessfulStarting': () => { console.log(chalk.greenBright(`===== Successfully started =====`)); },
    'UnsuccessfulStarting': (error) => {
        console.log(chalk.redBright(`===== Unsuccessful starting =====`));
        console.log(error);
    }
}