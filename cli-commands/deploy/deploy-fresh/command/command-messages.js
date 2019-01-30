const chalk = require('chalk');

module.exports = {
    'StartDeployment': () => { console.log(chalk.magentaBright('===== Deployment has started... =====')); },
    'DeployedByAccountOnNetwork': (contractAccount, network) => {
        console.log(chalk.greenBright('Your contract was successfully deployed on account: '));
        console.log(chalk.greenBright(`\tname: ${contractAccount.name}`));
        console.log(chalk.greenBright(`\tpublic key: ${contractAccount.publicKey}`));
        console.log(chalk.greenBright(`\tprivate key: ${contractAccount.privateKey}`));
    }
}