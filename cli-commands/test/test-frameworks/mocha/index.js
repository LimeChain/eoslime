const Mocha = require('mocha');
const mochaConfig = require('./mocha-config');

class MochaFramework {
    constructor(testFiles) {
        this.instance = new Mocha(mochaConfig);

        testFiles.forEach(testFile => {
            this.instance.addFile(testFile);
        });
    }

    async runTests() {
        return new Promise((resolve, reject) => {
            this.instance.run(failures => {
                process.exitCode = failures ? -1 : 0;
                if (failures) {
                    return void reject(failures)
                }

                resolve();
            });
        });
    }
}

module.exports = MochaFramework;
