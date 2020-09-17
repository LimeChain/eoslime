const AsyncSoftExec = require('../../helpers/async-soft-exec');
const Command = require('../command');

const MESSAGE_COMMAND = require('./messages').COMMAND;
const MESSAGE_CONTRACT = require('./messages').CONTRACT;

const compiledDirectories = require('./specific/directories.json');
const compileCommandDefinition = require('./definition');

const fileSysUtils = require('../../helpers/file-system-util');

// eoslime compile --path

class CompileCommand extends Command {

    constructor () {
        super(compileCommandDefinition);
    }

    async execute (args) {
        try {
            MESSAGE_COMMAND.Start();

            const optionsResults = await super.processOptions(args);

            if (optionsResults.path.length > 0) {
                fileSysUtils.createDir(compiledDirectories.COMPILED);

                for (let i = 0; i < optionsResults.path.length; i++) {
                    const contract = optionsResults.path[i];
                    await processCompilation(contract)
                }
            } else {
                MESSAGE_CONTRACT.NotFound();
            }
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }
}

const processCompilation = async function (contract) {
    try {
        const sources = contract.files.join(' ');
        const asyncSoftExec = new AsyncSoftExec(`eosio-cpp -I . -o ./compiled/${contract.name}.wasm ${sources} --abigen`);
        await asyncSoftExec.exec();

        MESSAGE_CONTRACT.Compiled(contract.name);
    } catch (error) {
        MESSAGE_CONTRACT.NotCompiled(error, contract.name);
    }
}

module.exports = CompileCommand;
