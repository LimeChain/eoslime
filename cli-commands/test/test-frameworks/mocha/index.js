const Mocha = require('mocha');
const mochaConfig = require('./mocha-config');

const EVENTS = {
    'allFinished': 'end'
}

class MochaFramework {
    constructor() {
        this.instance = new Mocha(mochaConfig);
        this.eventsHooks = [];

    }

    addTestFiles(testFiles) {
        testFiles.forEach(testFile => {
            this.instance.addFile(testFile);
        });
    }

    on(eventName, callback) {
        if (EVENTS[eventName]) {
            this.eventsHooks.push({
                event: EVENTS[eventName],
                callback: callback
            });
        }
    }

    async setDescribeArgs(...args) {
        this.instance.suite.on('pre-require', function (context) {
            const origDescribe = context.describe;
            context.describe = function (name, impl) {
                return origDescribe(name, function () {
                    return impl.call(this, ...args);
                });
            };
        });
    }

    async runTests() {
        const self = this;

        return new Promise((resolve, reject) => {

            const mochaRunner = self.instance.run(
                failures => {
                    process.exitCode = failures ? -1 : 0;
                    if (failures) {
                        return void reject(failures)
                    }

                    resolve();
                }
            );

            for (let i = 0; i < self.eventsHooks.length; i++) {
                const eventHook = self.eventsHooks[i];
                mochaRunner.on(eventHook.event, eventHook.callback);
            }
        });
    }
}

module.exports = MochaFramework;
