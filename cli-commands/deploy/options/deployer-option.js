const consoleInput = require('prompts');

const Option = require('../../option');
const AccountFactory = require('../../../src/account/normal-account/account-factory');

class DeployerOption extends Option {
    constructor() {
        super(
            'deployer',
            {
                "describe": "Deployer account",
                "type": "string",
            }
        );
    }

    async process(accountName, args) {
        const accountFactory = new AccountFactory(args.network);

        const deployerAuth = await consoleInput({
            type: 'text',
            name: 'value',
            message: 'Enter deployer private key and its permission in format: pKey@permission',
        });

        const deployerAuthParts = deployerAuth.value.split('@');
        return accountFactory.load(accountName, deployerAuthParts[0], deployerAuthParts[1] || 'active');
    }
}

module.exports = new DeployerOption();
