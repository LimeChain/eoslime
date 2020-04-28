const chalk = require('chalk');

module.exports = {
    'PredefinedAccounts': () => { console.log(chalk.magentaBright('===== Predefined accounts =====')); },
    'NodeosLogs': () => { console.log(chalk.magentaBright('===== Nodeos logs =====')); }
}