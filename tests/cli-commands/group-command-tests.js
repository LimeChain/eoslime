const assert = require('assert');

const TestOption = require('../cli-commands/mocks/test-option');
const GroupCommand = require('../../cli-commands/commands/group-command');

describe('GroupCommand', function () {
    let groupCommand;

    beforeEach(async () => {
        groupCommand = new GroupCommand({ options: [ TestOption ] });
    });

    it('Should initialize group command properly', async () => {
        assert(groupCommand instanceof GroupCommand);
        assert(groupCommand.options.length > 0);
    });

    it('Should process valid option', async () => {
        assert(await groupCommand.execute({ test: 'true' }));
    });

    it('Should return if not found valid option', async () => {
        assert(!(await groupCommand.execute({ sample: 'abc' })));
    });

});