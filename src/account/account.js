const eosECC = require('eosjs').modules.ecc;
const cryptoJS = require('crypto-js');

const Networks = require('./../helpers/networks.json');
const EOSInstance = require('./../helpers/eos-instance');

const createAccountNameFromPublicKey = require('./public-key-name-generator').createAccountNameFromPublicKey;

class Account {

    constructor(name, privateKey, network = 'local') {
        this.name = name;
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

        this.network = Networks[network] || network;
    }

    async loadRam(ramLoad = { payer: this, bytes: 10000 }) {
        validateAccount(ramLoad.payer);
        let eosInstance = new EOSInstance(this.network, ramLoad.payer.privateKey);

        await eosInstance.transaction(tr => {
            tr.buyrambytes({
                payer: payer.name,
                receiver: this.name,
                bytes: ramLoad.bytes
            });
        });
    }

    async loadBandwidth(bandwidthLoad = { payer: this, cpu: 10, net: 10 }) {
        validateAccount(bandwidthLoad.payer);
        let eosInstance = new EOSInstance(this.network, bandwidthLoad.payer.privateKey);

        await eosInstance.transaction(tr => {
            tr.delegatebw({
                from: bandwidthLoad.payer.name,
                receiver: this.name,
                stake_cpu_quantity: `${bandwidthLoad.cpu} SYS`,
                stake_net_quantity: `${bandwidthLoad.net} SYS`,
                transfer: 0
            });
        });
    }

    async send(toAccount, amount) {
        validateAccount(toAccount);
        let eosInstance = new EOSInstance(this.network, this.privateKey);

        await eosInstance.transfer(
            this.name,
            toAccount.name, `${amount} SYS`,
            this.permissions.active,
            { broadcast: true, sign: true }
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

    static async createFromName(accountName, accountCreator = defaultAccount) {
        validateAccount(accountCreator);

        let accountPrivateKey = await eosECC.randomKey();
        let newAccount = new Account(accountName, accountPrivateKey, accountCreator.network);

        await createAccountOnBlockchain(newAccount, accountCreator);

        return newAccount;
    }

    static async createRandom(accountCreator = defaultAccount) {
        validateAccount(accountCreator);

        let privateKey = await eosECC.randomKey();
        let publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();
        let name = createAccountNameFromPublicKey(publicKey);

        let newAccount = new Account(name, privateKey, accountCreator.network);
        await createAccountOnBlockchain(newAccount, accountCreator);

        return newAccount;
    }

    static async createRandoms(accountsCount, accountCreator = defaultAccount) {

        let accounts = [];
        for (let i = 0; i < accountsCount; i++) {
            let newAccount = await Account.createRandom(accountCreator);

            accounts.push(newAccount);
        }

        return accounts;
    }

    static async createEncrypted(password, accountCreator = defaultAccount) {
        let newAccount = await Account.createRandom(accountCreator);

        return JSON.stringify({
            accountName: newAccount.name,
            network: accountCreator.network,
            ciphertext: cryptoJS.AES.encrypt(newAccount.privateKey, password).toString()
        });
    }

    static fromEncryptedJson(json, password) {
        try {
            let encryptedAccountJson = JSON.parse(JSON.stringify(json));
            let privateKey = cryptoJS.AES.decrypt(encryptedAccountJson.ciphertext, password).toString(cryptoJS.enc.Utf8);

            return new Account(encryptedAccountJson.accountName, privateKey, encryptedAccountJson.network);
        } catch (error) {
            throw new Error('Invalid json account or password');
        }
    }
}

const defaultAccount = require('./../defaults/account-default').init(Account);

let validateAccount = function (account) {
    if (!(account instanceof Account)) {
        throw new Error('Provided account is not an instance of Account');
    }
}

let createAccountOnBlockchain = async function (accountToBeCreated, accountCreator) {
    let eosInstance = new EOSInstance(accountCreator.network, accountCreator.privateKey);

    await eosInstance.transaction(tr => {
        tr.newaccount({
            creator: accountCreator.name,
            name: accountToBeCreated.name,
            owner: accountToBeCreated.publicKey,
            active: accountToBeCreated.publicKey
        });
    });
}

module.exports = Account;