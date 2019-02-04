class DefaultAccount {
    constructor(Account) {
        if (!DefaultAccount.instance) {
            DefaultAccount.instance = new Account('eosio', '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3', 'local');
        }

        return DefaultAccount.instance;
    }
}

const initDefaultAccount = function (Account) {
    return new DefaultAccount(Account);
}

module.exports = {
    init: initDefaultAccount
}
