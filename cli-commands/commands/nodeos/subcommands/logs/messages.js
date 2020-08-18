const logger = require('../../../../common/logger');

module.exports = {
    'COMMAND': {
        'Success': (logs) => { logger.success(`===== Nodeos logs ===== \n ${logs}`); },
        'Error': (error) => { logger.error(`===== Logs has not been shown =====`, error); }
    },
    'LOGS': {
        'Empty': () => { logger.info('===== Empty logs ====='); },
    }
}
