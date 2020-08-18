const chalk = require('chalk');

const logger = {
    log: (message) => {
        console.log(message);
    },
    success: (message) => {
        console.log(chalk.greenBright(message));
    },
    info: (message) => {
        console.log(chalk.blueBright(message));
    },
    error: (message, error) => {
        console.log(chalk.redBright(message));
        console.log(error);
    }
}

module.exports = logger;
