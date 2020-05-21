const eosECC = require('eosjs').modules.ecc;

class BaseAccount {

    constructor(name, privateKey, provider, permission) {
        this.name = name;
        this.provider = provider;
        this.executiveAuthority = {
            actor: name,
            permission: permission
        }

        this.privateKey = privateKey;
        this.publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();
    }

    async getAuthorityInfo () {
        const authority = arguments[0] ? arguments[0] : this.executiveAuthority.permission;

        const accountInfo = await this.provider.eos.getAccount(this.name);
        const authorityInfo = accountInfo.permissions.find((permission) => {
            return authority == permission.perm_name;
        });

        if (!authorityInfo) {
            throw new Error('Could not find such authority on chain');
        }

        return authorityInfo;
    }
}

module.exports = BaseAccount;
