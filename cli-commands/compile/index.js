const AsyncSoftExec = require('./../utils/async-soft-exec');
const Command = require('./../command');

const commandMessages = require('./messages');
const compiledDirectories = require('./directories.json');
const compileCommandDefinition = require('./definition');

const fileSysUtils = require('./../utils/file-system-util');

// eoslime compile --path

class CompileCommand extends Command {

    constructor() {
        super(compileCommandDefinition);
    }

    async execute(args) {
        try {
            commandMessages.StartCompilation();

            const optionsResults = await super.processOptions(args);

            if (optionsResults.path.length > 0) {
                fileSysUtils.createDir(compiledDirectories.COMPILED);

                for (let i = 0; i < optionsResults.path.length; i++) {
                    // Todo: Check how to compile without using eosio-cpp
                    const asyncSoftExec = new AsyncSoftExec(`eosio-cpp -I . -o ./compiled/${contracts[i].fileName}.wasm ${contracts[i].fullPath} --abigen`);
                    asyncSoftExec.onError((error) => commandMessages.UnsuccessfulCompilationOfContract(error, contracts[i].fileName));
                    asyncSoftExec.onSuccess(() => commandMessages.SuccessfulCompilationOfContract(contracts[i].fileName));

                    await asyncSoftExec.exec();
                }
            } else {
                commandMessages.ContractNotExisting();
            }
        } catch (error) {
            commandMessages.UnsuccessfulCompilation(error);
        }
    }
}

module.exports = CompileCommand;
