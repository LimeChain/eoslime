const logger = require('../../common/logger');

module.exports = {
    'COMMAND': {
        'Start': () => { logger.info('===== Testing has started... ====='); },
        'Success': () => { logger.success(`===== Testing completed successfully =====`); },
        'Error': (error) => { logger.error(`===== Testing failed =====`, error); }
    }
}
