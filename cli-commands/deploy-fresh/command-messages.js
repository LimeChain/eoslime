const chalk = require('chalk');

module.exports = {
    'StartDeployment': () => { console.log(chalk.magentaBright('===== Deployment has started... =====')); },
    'DeployedByAccountOnNetwork': (deployer, network) => {
        console.log(chalk.greenBright('Your contract was successfully deployed on account: '));
        console.log(chalk.greenBright(`\tname: ${deployer.name}`));
        console.log(chalk.greenBright(`\tpublic key: ${deployer.publicKey}`));
        console.log(chalk.greenBright(`\tprivate key: ${deployer.privateKey}`));
    }
}