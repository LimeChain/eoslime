const logger = require('../../common/logger');

module.exports = {
    'COMMAND': {
        'Start': () => { logger.info('===== Shaping of DApp has started... ====='); },
        'Success': () => { logger.success(`===== Successful shaping =====`); },
        'Error': (error) => { logger.error(`===== Unsuccessful shaping =====`, error); },
    }
}
