const is = require('../../helpers/is');
const Account = require('../normal-account/account');

class AuthorityAccount extends Account {

    constructor (parentPermission, name, privateKey, provider, permission) {
        super(name, privateKey, provider, permission);
        this.parentPermission = parentPermission;
    }

    async setAuthorityAbilities (abilities) {
        is(abilities).instanceOf('Array');

        const txReceipt = await this.provider.eos.transaction(tr => {
            for (let i = 0; i < abilities.length; i++) {
                const ability = abilities[i];
                tr.linkauth({
                    account: this.name,
                    code: ability.contract,
                    type: ability.action,
                    requirement: this.executiveAuthority.permission
                }, { authorization: [`${this.name}@${parentAuthority}`] });
            }
        }, { broadcast: true, sign: true, keyProvider: this.privateKey });

        return txReceipt;
    }
}

module.exports = AuthorityAccount;
