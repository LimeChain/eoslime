const sinon = require('sinon');
const logger = require('../../../cli-commands/common/logger');

describe('Logger', function () {

    let consoleLogSpy;

    beforeEach(async () => {
        consoleLogSpy = sinon.spy(console, "log");
    });

    afterEach(async () => {
        sinon.restore();
    });

    it('Should log info message', async () => {
        logger.info('Test info message');

        sinon.assert.calledWith(consoleLogSpy, 'Test info message');
    });

    it('Should log error message', async () => {
        logger.error('Test error message', 'Error');

        sinon.assert.calledTwice(consoleLogSpy);
        consoleLogSpy.firstCall.calledWith('Test error message');
        consoleLogSpy.secondCall.calledWith('Error');
    });

});