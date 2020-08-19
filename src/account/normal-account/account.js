const is = require('../../helpers/is')
const eosECC = require('eosjs').modules.ecc;
const BaseAccount = require('../base-account');

class Account extends BaseAccount {

    constructor (name, privateKey, provider, permission) {
        super(name, privateKey, provider, permission);
    }

    async buyRam (bytes, payer = this) {
        is(payer).instanceOf('BaseAccount');

        return this.provider.eos.transaction(tr => {
            tr.buyrambytes({
                payer: payer.name,
                receiver: this.name,
                bytes: bytes
            });
        }, { keyProvider: payer.privateKey });
    }

    async buyBandwidth (cpu, net, payer = this) {
        is(payer).instanceOf('BaseAccount');

        return this.provider.eos.transaction(tr => {
            tr.delegatebw({
                from: payer.name,
                receiver: this.name,
                stake_cpu_quantity: cpu,
                stake_net_quantity: net,
                transfer: 0
            });
        }, { keyProvider: payer.privateKey });
    }

    async send (receiver, amount, symbol = 'EOS') {
        is(receiver).instanceOf('BaseAccount');

        return this.provider.eos.transfer(
            this.name,
            receiver.name,
            `${amount} ${symbol}`,
            this.authority,
            { broadcast: true, sign: true, keyProvider: this.privateKey }
        );
    }

    async addAuthority (authorityName, threshold = 1) {
        const authorization = {
            threshold,
            keys: [{ key: this.publicKey, weight: threshold }]
        }

        return updateAuthority.call(this, authorityName, this.authority.permission, authorization);
    }

    async setAuthorityAbilities (authorityName, abilities) {
        is(abilities).instanceOf('Array');

        const accountInfo = await this.provider.eos.getAccount(this.name);
        const hasAuthName = accountInfo.permissions.find((permissions) => {
            return permissions.perm_name == authorityName;
        });

        if (!hasAuthName) {
            throw new Error(`
                Account does not have authority with name: [${authorityName}]. 
                You could add it by using [addAuthority] function. 
                For details check [Set authority abilities] suite in account-tests.js
            `);
        }

        const txReceipt = await this.provider.eos.transaction(tr => {
            for (let i = 0; i < abilities.length; i++) {
                const ability = abilities[i];
                tr.linkauth({
                    account: this.name,
                    code: ability.contract,
                    type: ability.action,
                    requirement: authorityName
                }, { authorization: [this.authority] });
            }
        }, { broadcast: true, sign: true, keyProvider: this.privateKey });

        return txReceipt;
    }

    async increaseThreshold (threshold) {
        const authorityInfo = await this.getAuthorityInfo();
        authorityInfo.required_auth.threshold = threshold;

        return updateAuthority.call(this, authorityInfo.perm_name, authorityInfo.parent, authorityInfo.required_auth);
    }

    async addPermission (authorityName, weight = 1) {
        return this.addOnBehalfAccount(this.name, authorityName, weight);
    }

    async addOnBehalfAccount (accountName, authority = 'active', weight = 1) {
        const authorityInfo = await this.getAuthorityInfo();
        const hasAlreadyAccount = authorityInfo.required_auth.accounts.find((account) => {
            return account.permission.actor == accountName;
        });

        if (!hasAlreadyAccount) {
            authorityInfo.required_auth.accounts.push({ permission: { actor: accountName, permission: authority }, weight });
            return updateAuthority.call(this, authorityInfo.perm_name, authorityInfo.parent, authorityInfo.required_auth);
        }
    }

    async addOnBehalfKey (publicKey, weight = 1) {
        if (!eosECC.isValidPublic(publicKey)) {
            throw new Error('Provided public key is not a valid one');
        }

        const authorityInfo = await this.getAuthorityInfo();
        const hasAlreadyKey = authorityInfo.required_auth.keys.find((keyData) => {
            return keyData.key == publicKey;
        });

        if (!hasAlreadyKey) {
            authorityInfo.required_auth.keys.push({ key: publicKey, weight });
            return updateAuthority.call(this, authorityInfo.perm_name, authorityInfo.parent, authorityInfo.required_auth);
        }
    }

    async setWeight (weight) {
        const authorityInfo = await this.getAuthorityInfo();
        authorityInfo.required_auth.keys.map(authorityKey => {
            if (authorityKey.key == this.publicKey) {
                authorityKey.weight = weight;
            }
        });

        return updateAuthority.call(this, authorityInfo.perm_name, authorityInfo.parent, authorityInfo.required_auth);
    }

    async getBalance (symbol = 'EOS', code = 'eosio.token') {
        return this.provider.eos.getCurrencyBalance(code, this.name, symbol);
    }
}

const updateAuthority = async function (authorityName, parent, auth) {
    const txReceipt = await this.provider.eos.transaction(tr => {
        tr.updateauth({
            account: this.name,
            permission: authorityName,
            parent: parent,
            auth: auth
        }, { authorization: [this.authority] });

    }, { broadcast: true, sign: true, keyProvider: this.privateKey });

    return txReceipt;

}

module.exports = Account;
