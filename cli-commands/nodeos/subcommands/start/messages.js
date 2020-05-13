const chalk = require('chalk');

module.exports = {
    'StartingNodeos': () => { console.log(chalk.magentaBright('===== Starting nodeos ... =====')); },
    'NodeosAlreadyRunning': () => { console.log(chalk.redBright(`===== Nodeos is already running =====`)); },
    'SuccessfullyStarted': () => { console.log(chalk.greenBright(`===== Successfully started =====`)); },
    'UnsuccessfulStarting': (error) => {
        console.log(chalk.redBright(`===== Nodeos has not been started =====`));
        console.log(error);
    }
}