const logger = require('../../../../common/logger');

module.exports = {
    'COMMAND': {
        'Start': () => { logger.info('===== Stopping nodeos ... ====='); },
        'Success': () => { logger.success(`===== Successfully stopped =====`); },
        'Error': (error) => { logger.error(`===== Nodeos has not been stopped =====`, error); }
    }
}
