const Command = require('./../command');

const deployCommandDefinition = require('./deploy-command-definition.json');

// eoslime deploy --path --network --account

class DeployCommand extends Command {
    constructor() {
        super(deployCommandDefinition.template, deployCommandDefinition.description);
    }

    defineOptions(yargs) {
        super(yargs, deployCommandDefinition.options);
    }

    execute(argv) { }
}

module.exports = DeployCommand;
