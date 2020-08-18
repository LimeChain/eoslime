const logger = require('../../common/logger');

module.exports = {
    'CONTRACT': {
        'Compiled': (contract) => { logger.success(`===== ${contract} has been successfully compiled  =====`); },
        'NotCompiled': (error, file) => { logger.error(`===== Unsuccessful compilation of ${file} =====`, error); },
        'NotFound': () => { logger.info(`===== There is not a contract to compile =====`); }
    },
    'COMMAND': {
        'Start': () => { logger.info('===== Compilation has started... ====='); },
        'Error': (error) => { logger.error(`===== Unsuccessful compilation =====`, error); },
    }
}