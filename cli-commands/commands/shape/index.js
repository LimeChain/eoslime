const git = require('simple-git/promise')()

const Command = require('../command');

const MESSAGE_COMMAND = require('./messages').COMMAND;

const shapeCommandDefinition = require('./definition');

// eoslime shape --name

class ShapeCommand extends Command {
    constructor () {
        super(shapeCommandDefinition);
    }

    async execute (args) {
        try {
            MESSAGE_COMMAND.Start();

            const optionsResults = await super.processOptions(args);
            await git.clone(optionsResults.framework);

            MESSAGE_COMMAND.Success();
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }
}

module.exports = ShapeCommand;
