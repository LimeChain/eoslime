const chalk = require('chalk');

module.exports = {
    'StartCompilation': () => { console.log(chalk.magentaBright('===== Compilation has started... =====')); },
    'UnsuccessfulCompilation': (error) => {
        console.log(chalk.redBright(`===== Unsuccessful compilation =====`));
        console.log(error);
    },
    'SuccessfulCompilationOfContract': (contract) => { console.log(chalk.greenBright(`===== Successfully compilation of ${contract} =====`)); },
    'UnsuccessfulCompilationOfContract': (error, file) => {
        console.log(chalk.redBright(`===== Unsuccessful compilation of ${file} =====`));
        console.log(error);
    },
    'ContractNotExisting': () => { console.log(chalk.redBright(`===== There is not a contract to compile =====`)); }
}