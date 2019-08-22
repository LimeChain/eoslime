const Command = require('./../command');

const commandMessages = require('./command-messages');
const compiledDirectories = require('./compile-directories.json');
const compileCommandDefinition = require('./compile-command-definition');

const fileSysUtils = require('./../utils/file-system-util');

// eoslime compile --path

class CompileCommand extends Command {

    constructor() {
        super(compileCommandDefinition);
    }

    execute(args) {
        try {
            commandMessages.StartCompilation();

            super.processOptions(args, (option, result) => {
                args[option.name] = result;
            });

            compileContracts(args.path);
        } catch (error) {
            commandMessages.UnsuccessfulCompilation(error);
        }
    }
}

const compileContracts = function (contracts) {
    if (contracts.length > 0) {
        fileSysUtils.createDir(compiledDirectories.COMPILED);
    }

    for (let i = 0; i < contracts.length; i++) {
        exec(`eosio-cpp -I . -o ./compiled/${contracts[i]} ./${contracts[i]} --abigen`, (error) => {
            if (error) {
                commandMessages.UnsuccessfulCompilationOfContract(error, contracts[i]);
            }

            commandMessages.SuccessfulCompilationOfContract(contracts[i]);
        });
    }
}

module.exports = CompileCommand;
