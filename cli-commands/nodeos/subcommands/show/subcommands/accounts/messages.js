const chalk = require('chalk');

module.exports = {
    'PredefinedAccounts': () => { console.log(chalk.magentaBright('===== Predefined accounts =====')); },
    'UnsuccessfulShowing': (error) => {
        console.log(chalk.redBright(`===== Unsuccessful showing accounts =====`));
        console.log(error);
    }
}