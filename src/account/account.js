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

    async loadRam(ramLoad = defaultRAMLoad) {
        validateAccount(ramPayer);
        let eosInstance = new EOSInstance(this.network, ramLoad.ramPayer.privateKey);

        await eosInstance.transaction(tr => {
            tr.buyrambytes({
                payer: ramPayer.name,
                receiver: this.name,
                bytes: ramLoad.bytes
            });
        });
    }

    async loadBandwidth(bandwidthLoad = defaultBandwidthLoad) {
        validateAccount(bandwidthLoad.payer);
        let eosInstance = new EOSInstance(this.network, bandwidthLoad.payer.privateKey);

        await eosInstance.transaction(tr => {
            tr.delegatebw({
                from: bandwidthLoad.payer.name,
                receiver: this.name,
                stake_cpu_quantity: `${payer.cpuQuantity} SYS`,
                stake_net_quantity: `${payer.netQuantity} SYS`,
                transfer: 0
            });
        });
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

        return {
            accountName: newAccount.name,
            network: accountCreator.network,
            ciphertext: cryptoJS.AES.encrypt(newAccount.privateKey, password).toString()
        };
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

const defaultAccount = require('./../defaults/account-default');
const defaultRAMLoad = require('./../defaults/ram-load');
const defaultBandwidthLoad = require('./../defaults/bandwidth-load');

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
