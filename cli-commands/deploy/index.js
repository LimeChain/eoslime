const Command = require('./../command');

const commandMessages = require('./messages');
const deployCommandDefinition = require('./definition');

// eoslime deploy --path --network --deployer

class DeployCommand extends Command {
    constructor() {
        super(deployCommandDefinition);
    }

    async execute(args) {
        try {
            commandMessages.StartDeployment();
            const optionsResults = await super.processOptions(args);
            await runDeploymentScripts(optionsResults.path, optionsResults.network, optionsResults.deployer);
        } catch (error) {
            commandMessages.UnsuccessfulDeployment(error);
        }
        return true;
    }
}

const runDeploymentScripts = async function (deploymentScripts, ...configuration) {
    for (let i = 0; i < deploymentScripts.length; i++) {
        const deploymentScript = deploymentScripts[i];
        try {
            await deploymentScript.deploy(...configuration);
            commandMessages.SuccessfulDeploymentOfScript(deploymentScript.fileName);
        } catch (error) {
            commandMessages.UnsuccessfulDeploymentOfScript(deploymentScript.fileName, error);
        }
    }
}

module.exports = DeployCommand;
