const Option = require('../../option');
const AsyncSoftExec = require('../../../helpers/async-soft-exec');

class NodeosOption extends Option {
    constructor () {
        super(
            'nodeos',
            {
                "describe": "Start blockchain before tests and kill it afterwards",
                "type": "boolean",
                "default": false
            }
        );
    }

    async process (optionValue, args) {
        if (optionValue) {
            args.testFramework.on('allFinished', async () => {
                const asyncSoftExec = new AsyncSoftExec('eoslime nodeos stop');
                await asyncSoftExec.exec();
            });

            const asyncSoftExec = new AsyncSoftExec('eoslime nodeos start');
            await asyncSoftExec.exec();
        }
    }
}

module.exports = new NodeosOption();
