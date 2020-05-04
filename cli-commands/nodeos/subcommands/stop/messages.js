const chalk = require('chalk');

module.exports = {
    'StoppingNodeos': () => { console.log(chalk.magentaBright('===== Stopping nodeos ... =====')); },
    'NoRunningNodeos': () => { console.log(chalk.redBright('===== There is no running nodeos ... =====')); },
    'SuccessfulProcessTermination': () => { console.log(chalk.blueBright('===== Instance terminated =====')); },
    'UnsuccessfulProcessTermination': (error) => {
        console.log(chalk.redBright('===== Unsuccessful instance termination =====')); 
        console.log(error);
    },
    'SuccessfulCleanUp': () => { console.log(chalk.blueBright('===== Folder cleaned up =====')); },
    'UnsuccessfulCleanUp': (error) => {
        console.log(chalk.redBright('===== Unsuccessful folder clean up =====')); 
        console.log(error);
    },
    'SuccessfulStopping': () => { console.log(chalk.greenBright(`===== Successfully stopped =====`)); },
    'UnsuccessfulStopping': (error) => {
        console.log(chalk.redBright(`===== Unsuccessful stopping =====`));
        console.log(error);
    }
}