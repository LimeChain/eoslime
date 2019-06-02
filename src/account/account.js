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

    async send(toAccount, amount) {
        is(toAccount).instanceOf(Account);

        return this.provider.eos.transfer(
            this.name,
            toAccount.name,
            `${amount} EOS`,
            this.permissions.active,
            { broadcast: true, sign: true, keyProvider: this.privateKey }
        );
    }

    async getBalance(symbol = 'EOS', code = 'eosio.token') {
        return this.provider.eos.getCurrencyBalance(code, this.name, symbol);
    }
}

module.exports = Account;
