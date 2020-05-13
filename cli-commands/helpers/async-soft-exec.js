const exec = require('child_process').exec;

class AsyncSoftExec {
    constructor(command) {
        this.command = command;
    }

    onError(callback) {
        this.errorCallback = callback;
    }

    onSuccess(callback) {
        this.successCallback = callback;
    }

    async exec() {
        return new Promise((resolve, reject) => {
            exec(this.command, (error, stdout) => {
                if (error) {
                    this.errorCallback(error);
                    return void resolve(true);
                }

                this.successCallback(stdout);
                return void resolve(true);
            });
        });
    }
}


module.exports = AsyncSoftExec;
