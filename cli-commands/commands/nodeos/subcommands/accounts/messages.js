const chalk = require('chalk');

module.exports = {
    'PreloadedAccounts': () => { console.log(chalk.magentaBright('===== Preloaded accounts =====')); },
    'UnsuccessfulShowing': (error) => {
        console.log(chalk.redBright(`===== Accounts has not been shown =====`));
        console.log(error);
    }
}