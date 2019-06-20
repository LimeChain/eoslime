const is = require('../helpers/is')
const eosECC = require('eosjs').modules.ecc;

class Account {

    constructor(name, privateKey, provider) {
        this.name = name;
        this.provider = provider

        this.permissions = {
            active: {
                actor: name,
                permission: 'active'
            },
            owner: {
                actor: name,
                permission: 'owner'
            }
        };

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
            this.permissions.active,
            { broadcast: true, sign: true, keyProvider: this.privateKey }
        );
    }

    async addPermission(permissionName, privateKey) {
        this.permissions[permissionName] = {
            actor: this.name,
            permission: permissionName,
            publicKey: eosECC.PrivateKey.fromString(privateKey).toPublic().toString(),
            privateKey: privateKey
        };
    }

    async createPermission(permName, parentPermName, privateKey) {
        return this.provider.eos.transaction(tr => {
            tr.updateauth({
                account: this.name,
                permission: permName,
                parent: parentPermName,
                auth: eosECC.PrivateKey.fromString(privateKey).toPublic().toString()
            }, { authorization: [this.permissions.owner] });

        }, { broadcast: true, sign: true, keyProvider: this.privateKey });
    }

    async createAuthorityForPermission(authorityName, permName) {
        const accountInfo = await this.provider.eos.getAccount(this.name);
        const permission = accountInfo.permissions.find((permission) => {
            return permName == permission.perm_name;
        });

        if (!permission) {
            throw new Error('Could not add authority to non-existing permission');
        }

        permission.required_auth.accounts.push({ permission: { actor: this.name, permission: authorityName }, weight: 1 });

        return this.provider.eos.transaction(tr => {
            tr.updateauth({
                account: this.name,
                permission: permission.perm_name,
                parent: permission.parent,
                auth: permission.required_auth.required_auth
            }, { authorization: [this.permissions.owner] });

        }, { broadcast: true, sign: true, keyProvider: this.privateKey });
    }

    async getBalance(symbol = 'EOS', code = 'eosio.token') {
        return this.provider.eos.getCurrencyBalance(code, this.name, symbol);
    }
}

module.exports = Account;
