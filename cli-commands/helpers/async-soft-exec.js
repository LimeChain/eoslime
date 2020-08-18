const exec = require('child_process').exec;

class AsyncSoftExec {
    constructor (command) {
        this.command = command;
    }

    async exec () {
        return new Promise((resolve, reject) => {
            exec(this.command, async (error, stdout) => {
                if (error) {
                    return void reject(error);
                }

                return void resolve(stdout);
            });
        });
    }
}

module.exports = AsyncSoftExec;
