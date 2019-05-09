const Account = require('./account');

const is = require('../helpers/is')
const cryptoJS = require('crypto-js');
const eosECC = require('eosjs').modules.ecc;
const createAccountNameFromPublicKey = require('./public-key-name-generator').createAccountNameFromPublicKey;

class AccountFactory {
    constructor(provider) {
        this.provider = provider;
    }

    async load(name, privateKey) {
        return new Account(name, privateKey, this.provider);
    }

    async createFromName(accountName, accountCreator = this.provider.defaultAccount) {
        is(accountCreator).instanceOf(Account);

        let accountPrivateKey = await eosECC.randomKey();
        let newAccount = new Account(accountName, accountPrivateKey, this.provider);

        await createAccountOnBlockchain(newAccount, accountCreator);

        return newAccount;
    }

    async createRandom(accountCreator = this.provider.defaultAccount) {
        is(accountCreator).instanceOf(Account);

        let privateKey = await eosECC.randomKey();
        let publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();
        let name = createAccountNameFromPublicKey(publicKey);

        let newAccount = new Account(name, privateKey, this.provider);
        await createAccountOnBlockchain(newAccount, accountCreator);

        return newAccount;
    }

    async createRandoms(accountsCount, accountCreator = this.provider.defaultAccount) {
        let accounts = [];
        for (let i = 0; i < accountsCount; i++) {
            let newAccount = await this.createRandom(accountCreator);

            accounts.push(newAccount);
        }

        return accounts;
    }

    async createEncrypted(password, accountCreator = this.provider.defaultAccount) {
        let newAccount = await this.createRandom(accountCreator);

        return JSON.stringify({
            accountName: newAccount.name,
            network: accountCreator.network,
            ciphertext: cryptoJS.AES.encrypt(newAccount.privateKey, password).toString()
        });
    }

    // Todo: Think about encryption + provider
    async fromEncryptedJson(json, password) {
        try {
            let encryptedAccountJson = JSON.parse(JSON.stringify(json));
            let privateKey = cryptoJS.AES.decrypt(encryptedAccountJson.ciphertext, password).toString(cryptoJS.enc.Utf8);

            return new Account(encryptedAccountJson.accountName, privateKey, encryptedAccountJson.network);
        } catch (error) {
            throw new Error('Invalid json account or password');
        }
    }
}

let createAccountOnBlockchain = async function (accountToBeCreated, accountCreator) {
    await accountToBeCreated.provider.eos.transaction(tr => {
        tr.newaccount({
            creator: accountCreator.name,
            name: accountToBeCreated.name,
            owner: accountToBeCreated.publicKey,
            active: accountToBeCreated.publicKey
        });
    }, { keyProvider: accountCreator.privateKey });
}

module.exports = AccountFactory;
