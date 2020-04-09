const AsyncSoftExec = require('./../helpers/async-soft-exec');

const Command = require('./../command');

const commandMessages = require('./messages');
const shapeCommandDefinition = require('./definition');

const git = require('simple-git/promise')()

// eoslime shape --name

class ShapeCommand extends Command {
    constructor() {
        super(shapeCommandDefinition);
    }

    async execute(args) {
        try {
            commandMessages.StartShaping();
            const optionsResults = await super.processOptions(args);
            const shape = optionsResults.name;

            if (!shape.repository) {
                commandMessages.InvalidShapeName(shape.name);
            }

            await git.init();
            await git.addRemote('origin', shape.repository);
            await git.pull('origin', 'master');

            const asyncSoftExec = new AsyncSoftExec('npm install');
            asyncSoftExec.onError((error) => { commandMessages.UnsuccessfulInstallation(error); });
            asyncSoftExec.onSuccess(() => { commandMessages.SuccessfulInstallation(); });

            await asyncSoftExec.exec();
        } catch (error) {
            commandMessages.UnsuccessfulShaping(error);
        }
    }
}

module.exports = ShapeCommand;
