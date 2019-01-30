const Option = require('./../../option');
const Account = require('./../../../src/account/account');

class ContractAccountOption extends Option {
    constructor() {
        super(
            'contractAccount',
            {
                "describe": "Account the contract is going to be deployed on",
                "type": "string",
                "default": JSON.stringify(Account.random())
            }
        );
    }

    execute(optionValue) {
        let parsedOptionValue = JSON.parse(optionValue);
        optionValue = new Account(parsedOptionValue.name, parsedOptionValue.privateKey);

        return optionValue;
    }
}

module.exports = new ContractAccountOption();
