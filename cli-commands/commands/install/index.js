const Command = require('../command');
const AsyncSoftExec = require('../../helpers/async-soft-exec');

const MESSAGE_COMMAND = require('./messages').COMMAND;

const getos = require('getos');
const osScripts = require('./specifics/os-scripts');
const installCommandDefinition = require('./definition');

// eoslime install

class InstallCommand extends Command {
    constructor () {
        super(installCommandDefinition);
    }

    async execute (args) {
        try {
            MESSAGE_COMMAND.Start();

            const optionsResults = await super.processOptions(args);

            const os = await this.extractOS();
            const installCommand = osScripts[os](optionsResults.version);

            const asyncSoftExec = new AsyncSoftExec(installCommand);
            await asyncSoftExec.exec();

            MESSAGE_COMMAND.Success();
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }

    async extractOS () {
        return new Promise((resolve, reject) => {
            getos(function (error, os) {
                if (error) return reject(error);
                if (os.os == 'darwin') return resolve('MAC_OS');
                return resolve(os.dist + os.release.substring(0, 2));
            });
        });
    }
}

module.exports = InstallCommand;
