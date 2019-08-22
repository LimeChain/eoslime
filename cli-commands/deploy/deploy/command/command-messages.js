const chalk = require('chalk');

module.exports = {
    'StartDeployment': () => { console.log(chalk.magentaBright('===== Deployment has started... =====')); },
    'SuccessfulDeploymentOfScript': (script) => { console.log(chalk.greenBright(`===== Successful deployment of ${script} =====`)); },
    'UnsuccessfulDeploymentOfScript': (script) => {
        console.log(chalk.redBright(`===== Unsuccessful deployment of ${script} =====`));
        console.log(error);
    },
    'UnsuccessfulDeployment': (error) => {
        console.log(chalk.redBright(`===== Unsuccessful deployment =====`));
        console.log(error);
    }
}