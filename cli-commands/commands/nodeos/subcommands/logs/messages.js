const chalk = require('chalk');

module.exports = {
    'NodeosLogs': (logs) => {
        console.log(chalk.magentaBright('===== Nodeos logs ====='));
        console.log(logs);
    },
    'EmptyLogs': () => {
        console.log(chalk.blueBright('===== Empty logs ====='));
    },
    'UnsuccessfulShowing': (error) => {
        console.log(chalk.redBright(`===== Logs has not been shown =====`));
        console.log(error);
    }
}