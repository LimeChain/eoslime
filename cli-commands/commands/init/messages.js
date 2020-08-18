const logger = require('../../common/logger');

module.exports = {
    'COMMAND': {
        'Start': () => { logger.info('===== Installing eoslime... ====='); },
        'Success': () => { logger.success('===== Successfully installed ====='); },
        'Error': (error) => { logger.error('===== Unsuccessful installation =====', error); }
    }
}
