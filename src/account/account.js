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

    async loadRam(ramLoad = { payer: this, bytes: 10000 }) {
        is(ramLoad.payer).instanceOf(Account);

        await this.provider.eos.transaction(tr => {
            tr.buyrambytes({
                payer: payer.name,
                receiver: this.name,
                bytes: ramLoad.bytes
            });
        }, { keyProvider: ramLoad.payer.privateKey });
    }

    async loadBandwidth(bandwidthLoad = { payer: this, cpu: 10, net: 10 }) {
        is(bandwidthLoad.payer).instanceOf(Account);

        await this.provider.eos.transaction(tr => {
            tr.delegatebw({
                from: bandwidthLoad.payer.name,
                receiver: this.name,
                stake_cpu_quantity: `${bandwidthLoad.cpu} SYS`,
                stake_net_quantity: `${bandwidthLoad.net} SYS`,
                transfer: 0
            });
        }, { keyProvider: ramLoad.payer.privateKey });
    }

    async send(toAccount, amount) {
        is(toAccount).instanceOf(Account);

        await this.provider.eos.transfer(
            this.name,
            toAccount.name, `${amount} SYS`,
            this.permissions.active,
            { broadcast: true, sign: true },
            { keyProvider: this.privateKey }
        );
    }

    async getBalance() {
        // let eosInstance = new EOSInstance(this.network, this.privateKey);

        // let balance = await eosInstance.getCurrencyBalance('myaccount', 'myaccount', 'SYS');
        // return balance;
        // await eosInstance.transfer(
        //     this.name,
        //     toAccount.name, `${amount} SYS`,
        //     this.permissions.active,
        //     { broadcast: true, sign: true }
        // );
    }


}

module.exports = Account;
