const is = require('../../helpers/is')

class AuthorityAccount {

    static construct(account, parentPermission) {
        account.setAuthorityAbilities = setAuthorityAbilities(account, parentPermission);
        return account;
    }
}

const setAuthorityAbilities = function (account, parentAuthority) {
    return async function (abilities) {
        is(abilities).instanceOf('Array');

        await account.provider.eos.transaction(tr => {
            for (let i = 0; i < abilities.length; i++) {
                const ability = abilities[i];
                tr.linkauth({
                    account: account.name,
                    code: ability.contract,
                    type: ability.action,
                    requirement: account.executiveAuthority.permission
                }, { authorization: [`${this.name}@${parentAuthority}`] });
            }
        }, { broadcast: true, sign: true, keyProvider: account.privateKey });
    }
}

module.exports = AuthorityAccount;
