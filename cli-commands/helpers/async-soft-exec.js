const exec = require('child_process').exec;

class AsyncSoftExec {
    constructor(command) {
        this.command = command;

        this.successCallback = () => { };
        this.errorCallback = (error) => { throw new Error(error) };
    }

    onError (callback) {
        this.errorCallback = callback;
    }

    onSuccess (callback) {
        this.successCallback = callback;
    }

    async exec () {
        return new Promise((resolve, reject) => {
            exec(this.command, async (error, stdout) => {
                try {
                    if (error) {
                        await this.errorCallback(error);
                        return void resolve(true);
                    }

                    await this.successCallback(stdout);
                    return void resolve(true);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}


module.exports = AsyncSoftExec;
