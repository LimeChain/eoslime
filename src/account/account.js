const is = require('../helpers/is')
const eosECC = require('eosjs').modules.ecc;

class Account {

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

    async buyRam(bytes, payer = this) {
        is(payer).instanceOf(Account);

        return this.provider.eos.transaction(tr => {
            tr.buyrambytes({
                payer: payer.name,
                receiver: this.name,
                bytes: bytes
            });
        }, { keyProvider: payer.privateKey });
    }

    async buyBandwidth(cpu, net, payer = this) {
        is(payer).instanceOf(Account);

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

    async send(receiver, amount, symbol = 'EOS') {
        is(receiver).instanceOf(Account);

        return this.provider.eos.transfer(
            this.name,
            receiver.name,
            `${amount} ${symbol}`,
            this.executiveAuthority,
            { broadcast: true, sign: true, keyProvider: this.privateKey }
        );
    }

    async createAuthority(authorityName, threshold = 1) {
        const authorization = {
            threshold,
            keys: [{ key: this.publicKey, weight: threshold }]
        }
        await setAuthority.call(this, authorityName, this.executiveAuthority.permission, authorization);

        return new Account(this.name, this.privateKey, this.provider, authorityName);
    }

    async setAuthorityAbilities(authorityName, abilities) {
        is(abilities).instanceOf(Array);

        /*
            abilities => 
                [
                    action,
                    contract
                ]
            
        */

        await this.provider.eos.transaction(tr => {
            for (let i = 0; i < abilities.length; i++) {
                const ability = abilities[i];
                tr.linkauth({
                    account: this.name,
                    code: ability.contract,
                    type: ability.action,
                    requirement: authorityName
                }, { authorization: [this.executiveAuthority] });
            }
        }, { broadcast: true, sign: true, keyProvider: this.privateKey });
    }

    // Todo: Think about increase/decrease Threshold
    async setThreshold(threshold) {
        const authorityInfo = await this.getAuthorityInfo();
        authorityInfo.required_auth.threshold = threshold;

        return setAuthority.call(this, authorityInfo.perm_name, authorityInfo.parent, authorityInfo.required_auth);
    }

    async addPermission(authorityName, weight = 1) {
        return this.addOnBehalfAccount(this.name, authorityName, weight);
    }

    async addOnBehalfAccount(accountName, authority = 'active', weight = 1) {
        const authorityInfo = await this.getAuthorityInfo();
        const hasAlreadyAccount = authorityInfo.required_auth.accounts.find((account) => {
            return account.permission.actor == accountName;
        });

        if (!hasAlreadyAccount) {
            authorityInfo.required_auth.accounts.push({ permission: { actor: accountName, permission: authority }, weight });
            return setAuthority.call(this, authorityInfo.perm_name, authorityInfo.parent, authorityInfo.required_auth);
        }
    }

    async addAuthorityKey(publicKey, weight = 1) {
        if (!eosECC.isValidPublic(publicKey)) {
            throw new Error('Provided public key is not a valid one');
        }

        const authorityInfo = await this.getAuthorityInfo();
        const hasAlreadyKey = authorityInfo.required_auth.keys.find((keyData) => {
            return keyData.key == publicKey;
        });

        if (!hasAlreadyKey) {
            authorityInfo.required_auth.keys.push({ key: publicKey, weight });
            return setAuthority.call(this, authorityInfo.perm_name, authorityInfo.parent, authorityInfo.required_auth);
        }
    }

    // Todo: Implement it
    async setWeight() {

    }

    async getAuthorityInfo() {
        const accountInfo = await this.provider.eos.getAccount(this.name);
        const authorityInfo = accountInfo.permissions.find((permission) => {
            return this.executiveAuthority.permission == permission.perm_name;
        });

        if (!authorityInfo) {
            throw new Error('Could not find such authority on chain');
        }

        return authorityInfo;
    }

    async getBalance(symbol = 'EOS', code = 'eosio.token') {
        return this.provider.eos.getCurrencyBalance(code, this.name, symbol);
    }
}

// Private methods
const setAuthority = async function (authorityName, parent, auth) {
    await this.provider.eos.transaction(tr => {
        tr.updateauth({
            account: this.name,
            permission: authorityName,
            parent: parent,
            auth: auth
        }, { authorization: [this.executiveAuthority] });

    }, { broadcast: true, sign: true, keyProvider: this.privateKey });

}

module.exports = Account;
