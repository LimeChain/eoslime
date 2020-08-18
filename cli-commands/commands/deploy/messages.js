const logger = require('../../common/logger');

module.exports = {
    'SCRIPT': {
        'Processed': (script) => { logger.success(`===== Successful deployment of ${script} =====`); },
        'NotProcessed': (script, error) => { logger.error(`===== Unsuccessful deployment of ${script} =====`, error); },
    },
    'COMMAND': {
        'Start': () => { logger.info('===== Deployment has started... ====='); },
        'Error': (error) => { logger.error(`===== Unsuccessful deployment =====`, error); }
    }
}