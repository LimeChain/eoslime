const chalk = require('chalk');

module.exports = {
    'StoppingNodeos': () => { console.log(chalk.magentaBright('===== Stopping nodeos ... =====')); },
    'NoRunningNodeos': () => { console.log(chalk.redBright('===== There is no running nodeos ... =====')); },
    'SuccessfullyStopped': () => { console.log(chalk.greenBright(`===== Successfully stopped =====`)); },
    'UnsuccessfulStopping': (error) => {
        console.log(chalk.redBright(`===== Nodeos has not been stopped =====`));
        console.log(error);
    }
}