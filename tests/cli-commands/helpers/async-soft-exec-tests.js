const assert = require('assert');

const AsyncSoftExec = require('../../../cli-commands/helpers/async-soft-exec');

const COMMAND_ECHO = 'echo'
const INVALID_COMMAND = 'ech';

describe('AsyncSoftExec', function () {
    let asyncSoftExec;

    it('Should execute sample command [default success callback]', async () => {
        asyncSoftExec = new AsyncSoftExec(COMMAND_ECHO);

        assert(await asyncSoftExec.exec());
    });

    it('Should execute sample command', async () => {
        asyncSoftExec = new AsyncSoftExec(COMMAND_ECHO);
        asyncSoftExec.onSuccess(() => {});

        assert(await asyncSoftExec.exec());
    });

    it('Should throw when command is unknown [default error callback]', async () => {
        asyncSoftExec = new AsyncSoftExec(INVALID_COMMAND);

        try {
            await asyncSoftExec.exec();
        } catch (error) {
            assert(true);
        }
    });

    it('Should throw when command is unknown', async () => {
        asyncSoftExec = new AsyncSoftExec(INVALID_COMMAND);
        asyncSoftExec.onError(() => {});

        await asyncSoftExec.exec();
        assert(true);
    });

});