const Command = require('./../../command');

const deployCommandDefinition = require('./deploy-command-definition.js');

// eoslime deploy --path --network --contractAccount

class DeployCommand extends Command {
    constructor() {
        super(deployCommandDefinition.template, deployCommandDefinition.description);
    }

    defineOptions(yargs) {
        super.defineOptions(yargs, deployCommandDefinition.options);
    }

    execute(args) {
        super.__execute(args, deployCommandDefinition.options);
    }
}

module.exports = new DeployCommand();
