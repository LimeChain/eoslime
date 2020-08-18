const Command = require('../command');

const MESSAGE_COMMAND = require('./messages').COMMAND;
const MESSAGE_SCRIPT = require('./messages').SCRIPT;

const deployCommandDefinition = require('./definition');

// eoslime deploy --path --network --deployer

class DeployCommand extends Command {
    constructor () {
        super(deployCommandDefinition);
    }

    async execute (args) {
        try {
            MESSAGE_COMMAND.Start();

            const optionsResults = await super.processOptions(args);
            await runDeploymentScripts(optionsResults.path, optionsResults.network, optionsResults.deployer);
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }
}

const runDeploymentScripts = async function (deploymentScripts, ...configuration) {
    for (let i = 0; i < deploymentScripts.length; i++) {
        const deploymentScript = deploymentScripts[i];
        try {
            await deploymentScript.deploy(...configuration);
            MESSAGE_SCRIPT.Processed(deploymentScript.fileName);
        } catch (error) {
            MESSAGE_SCRIPT.NotProcessed(deploymentScript.fileName, error);
        }
    }
}

module.exports = DeployCommand;
