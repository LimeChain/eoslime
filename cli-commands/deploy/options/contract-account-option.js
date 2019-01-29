const Option = require('./../../option');

class ContractAccountOption extends Option {
    constructor() {
        super(
            'contractAccount',
            {
                "describe": "Account the contract is going to be deployed on",
                "type": "string"
            }
        );
    }

    execute(optionValue) { }
}

module.exports = new ContractAccountOption();
