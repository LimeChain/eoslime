const assert = require('assert');

const Command = require('../../cli-commands/commands/command');

describe('Command', function () {
    let command;

    beforeEach(async () => {
        command = new Command({});
    });

    it('Should initialize command properly', async () => {
        assert(command instanceof Command);
        assert(command.template == '');
        assert(command.description == '');
        assert(command.options.length == 0);
        assert(command.subcommands.length == 0);
    });

});