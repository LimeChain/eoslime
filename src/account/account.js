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

    async createAuthority(authorityName) {
        const authPrivateKey = await eosECC.randomKey();

        await this.provider.eos.transaction(tr => {
            tr.updateauth({
                account: this.name,
                permission: authorityName,
                parent: this.executiveAuthority.permission,
                auth: eosECC.PrivateKey.fromString(authPrivateKey).toPublic().toString()
            }, { authorization: [this.executiveAuthority] });

        }, { broadcast: true, sign: true, keyProvider: this.privateKey });

        return new Account(this.name, authPrivateKey, this.provider, authorityName);
    }

    async addPermission(permName) {
        const accountInfo = await this.provider.eos.getAccount(this.name);
        const authority = accountInfo.permissions.find((permission) => {
            return this.executiveAuthority.permission == permission.perm_name;
        });

        if (!authority) {
            throw new Error('Could not add permission to non-existing authority');
        }

        const hasAlreadyPermission = authority.required_auth.accounts.find((account) => {
            return account.permission.permission == permName;
        });

        if (!hasAlreadyPermission) {
            authority.required_auth.accounts.push({ permission: { actor: this.name, permission: permName }, weight: 1 });

            return this.provider.eos.transaction(tr => {
                tr.updateauth({
                    account: this.name,
                    permission: authority.perm_name,
                    parent: authority.parent,
                    auth: authority.required_auth
                }, { authorization: [this.executiveAuthority] });

            }, { broadcast: true, sign: true, keyProvider: this.privateKey });
        }
    }

    async getBalance(symbol = 'EOS', code = 'eosio.token') {
        return this.provider.eos.getCurrencyBalance(code, this.name, symbol);
    }
}

module.exports = Account;
