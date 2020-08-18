const logger = require('../../../../common/logger');

module.exports = {
    'COMMAND': {
        'Start': () => { logger.info('===== Preloaded accounts ====='); },
        'Error': (error) => { logger.error(`===== Accounts has not been shown =====`, error); }
    }
}