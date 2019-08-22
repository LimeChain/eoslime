const consoleInput = require('prompts');

const Option = require('./../../option');
const AccountFactory = require('./../../../../src/account/account-factory');

class ContractAccountOption extends Option {
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

        if (accountName) {
            const deployerPrivateKey = await consoleInput({
                type: 'string',
                name: 'privateKey',
                message: 'Enter deployer private key'
            });

            return accountFactory.load(accountName, deployerPrivateKey, 'active');
        }

        return accountFactory.createRandom();
    }
}

module.exports = new ContractAccountOption();
