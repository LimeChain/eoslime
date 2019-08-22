const Command = require('./../../command');

const commandMessages = require('./command-messages');
const deployCommandDefinition = require('./deploy-command-definition.js');

// eoslime deploy --path --network --contractAccount

class DeployCommand extends Command {
    constructor() {
        super(deployCommandDefinition);
    }

    async execute(args) {
        commandMessages.StartDeployment();

        try {
            super.process(args, (option, result) => {
                args[option.name] = result;
            });

            await runDeploymentScripts(args.path, args.network, args.deployer);
        } catch (error) {
            commandMessages.UnsuccessfulDeployment(error);
        }
    }
}

const runDeploymentScripts = async function (deploymentScripts, networkProvider, deployer) {
    deploymentScripts.forEach(deploymentScript => {
        try {
            await deploymentScript.deploy(networkProvider, deployer);
            commandMessages.SuccessfulDeploymentOfScript(deploymentScript);
        } catch (error) {
            commandMessages.UnsuccessfulDeploymentOfScript(deploymentScript, error);
        }
    });
}

module.exports = new DeployCommand();
