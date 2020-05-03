const chalk = require('chalk');

module.exports = {
    'NodeosLogs': (logs) => {
        console.log(chalk.magentaBright('===== Nodeos logs ====='));
        console.log(logs);
    },
    'UnsuccessfulShowing': (error) => {
        console.log(chalk.redBright(`===== Unsuccessful showing logs =====`));
        console.log(error);
    }
}