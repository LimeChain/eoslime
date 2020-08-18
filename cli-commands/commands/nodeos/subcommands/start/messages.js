const logger = require('../../../../common/logger');

module.exports = {
    'COMMAND': {
        'Start': () => { logger.info('===== Starting nodeos ... ====='); },
        'Success': () => { logger.success(`===== Successfully started =====`); },
        'Error': (error) => { logger.error(`===== Nodeos has not been started =====`, error); }
    },
    'NODEOS': {
        'AlreadyRunning': () => { logger.info(`===== Nodeos is already running =====`); },
    }
}