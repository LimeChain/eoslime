const is = require('../helpers/is')
const eosECC = require('eosjs').modules.ecc;

class Account {

    constructor(name, privateKey, provider) {
        this.keys = {}
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

        this.keys['owner'] = {}
        this.keys['active'] = {}
        this.keys['owner']['private'] = this.privateKey;
        this.keys['owner']['public'] = this.publicKey;
        this.keys['active']['private'] = this.privateKey;
        this.keys['active']['public'] = this.publicKey;
    }

    addKey(keyname, privateKey) {
        this.keys[keyname] = {}
        this.keys[keyname]['private'] = privateKey;
        publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();
        this.keys[keyname]['public'] = publicKey;
    }

    async buyRam(bytes, payer = this) {
        is(payer).instanceOf(Account);

        return this.provider.eos.transaction(tr => {
            tr.buyrambytes({
                payer: payer.name,
                receiver: this.name,
                bytes: bytes
            });
        }, { keyProvider: payer.keys['active']['private'] });
    }

    async buyBandwidth(cpu, net, payer = this) {
        is(payer).instanceOf(Account);

        return this.provider.eos.transaction(tr => {
            tr.delegatebw({
                from: payer.name,
                receiver: this.name,
                stake_cpu_quantity: `${cpu} SYS`,
                stake_net_quantity: `${net} SYS`,
                transfer: 0
            });
        }, { keyProvider: payer.keys['active']['private'] });
    }

    async send(toAccount, amount) {
        is(toAccount).instanceOf(Account);

        return this.provider.eos.transfer(
            this.name,
            toAccount.name,
            `${amount} SYS`,
            this.permissions.active,
            { broadcast: true, sign: true, keyProvider: this.keys['active']['private'] }
        );
    }

    async getBalance(code = 'eosio.token', symbol = 'SYS') {
        return this.provider.eos.getCurrencyBalance(code, this.name, symbol);
    }
}

module.exports = Account;
