const Mocha = require('mocha');
const mochaConfig = require('./mocha-config');

const EVENTS = {
    'allFinished': 'suite end'
}

class MochaFramework {
    constructor(testFiles) {
        this.instance = new Mocha(mochaConfig);
        this.eventsHooks = [];

        testFiles.forEach(testFile => {
            this.instance.addFile(testFile);
        });
    }

    on(eventName, callback) {
        this.eventsHooks.push({
            event: EVENTS[eventName],
            callback: callback
        });
    }

    async runTests() {
        return new Promise((resolve, reject) => {
            const mochaRunner = this.instance.run(
                failures => {
                    process.exitCode = failures ? -1 : 0;
                    if (failures) {
                        return void reject(failures)
                    }

                    resolve();
                }
            );

            for (let i = 0; i < this.eventHooks.length; i++) {
                const eventHook = this.eventHooks[i];
                mochaRunner.on(eventHook.event, eventHook.callback);
            }
        });
    }
}

module.exports = MochaFramework;
