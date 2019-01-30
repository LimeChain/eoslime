const Command = require('./../../command');

const commandMessages = require('./command-messages');
const deployCommandDefinition = require('./deploy-command-definition.js');

// eoslime deploy --path --network --contractAccount

class DeployCommand extends Command {
    constructor() {
        super(deployCommandDefinition.template, deployCommandDefinition.description);
    }

    defineOptions(yargs) {
        super.defineOptions(yargs, deployCommandDefinition.options);
    }

    async execute(args) {
        commandMessages.StartDeployment();

        super.__execute(args, deployCommandDefinition.options, (option, executionResult) => {
            args[option.name] = executionResult;
        });

        args.path.forEach(deploymentFileFunction => {
            await deploymentFileFunction(args.network, args.contractAccount);
        });

        commandMessages.StartDeployment();
    }
}

module.exports = new DeployCommand();
