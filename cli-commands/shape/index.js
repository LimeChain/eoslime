const git = require('simple-git/promise')()

const Command = require('./../command');

const commandMessages = require('./messages');
const shapeCommandDefinition = require('./definition');

// eoslime shape --name

class ShapeCommand extends Command {
    constructor() {
        super(shapeCommandDefinition);
    }

    async execute(args) {
        try {
            commandMessages.StartShaping();
            const optionsResults = await super.processOptions(args);

            if (!optionsResults.framework) {
                commandMessages.InvalidShapeName(args.framework);
            }

            await git.clone(optionsResults.framework);

            commandMessages.SuccessfulShaping();
        } catch (error) {
            commandMessages.UnsuccessfulShaping(error);
        }

        return true;
    }
}

module.exports = ShapeCommand;
