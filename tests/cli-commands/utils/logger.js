const logger = require('../../../cli-commands/common/logger');

class Logger {

    constructor () {
        this.events = {}
    }

    hide (sinon) {
        const self = this
        sinon.stub(logger, 'log').callsFake((message) => {
            if (self.events['log']) {
                for (let i = 0; i < self.events['log'].length; i++) {
                    self.events['log'][i](message)
                }
            }
        });

        sinon.stub(logger, 'info').callsFake((message) => {
            if (self.events['info']) {
                for (let i = 0; i < self.events['info'].length; i++) {
                    self.events['info'][i](message)
                }
            }
        });

        sinon.stub(logger, 'success').callsFake((message) => {
            if (self.events['success']) {
                for (let i = 0; i < self.events['success'].length; i++) {
                    self.events['success'][i](message)
                }
            }
        });

        sinon.stub(logger, 'error').callsFake((message, error) => {
            if (self.events['error']) {
                for (let i = 0; i < self.events['error'].length; i++) {
                    self.events['error'][i](message)
                }
            }

            // throw new Error(error.message);
        });
    }

    on (event, cb) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(cb)
    }
}

module.exports = Logger;
