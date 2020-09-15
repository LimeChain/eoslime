const logger = require('../../common/logger');

module.exports = {
    'COMMAND': {
        'Start': () => { logger.info('===== Installation has started... ====='); },
        'Success': () => { logger.success(`===== Successfully installed =====`); },
        'Error': (error) => { logger.error(`===== Unsuccessful installation =====`, error); }
    }
}
