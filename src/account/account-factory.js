const Account = require('./account');

const is = require('./../helpers/is')
const eosECC = require('eosjs').modules.ecc;
const crypto = require('./../helpers/crypto');
const createAccountNameFromPublicKey = require('./public-key-name-generator').createAccountNameFromPublicKey;

class AccountFactory {
    constructor(provider) {
        this.provider = provider;
    }

    load(name, privateKey) {
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
        try {
            let newAccount = await this.createRandom(accountCreator);
            let dataToBeEncrypted = {
                name: newAccount.name,
                network: newAccount.provider.network,
            };

            let dataHash = crypto.hash(JSON.stringify({ ...dataToBeEncrypted, keys: newAccount.keys }));
            let cipherText = crypto.encrypt(`${newAccount.keys}::${dataHash}`, password);

            return { ...dataToBeEncrypted, cipherText };
        } catch (error) {
            throw new Error(`Account encryption: ${error.message}`);
        }
    }

    fromEncrypted(encryptedAccount, password) {
        try {
            let decryptedAccount = JSON.parse(JSON.stringify(encryptedAccount));

            let pureData = crypto.decrypt(encryptedAccount.cipherText, password);
            let dataParts = pureData.split('::');

            delete decryptedAccount.cipherText;
            decryptedAccount.privateKey = dataParts[0];
            decryptedAccount.network = this.provider.network;

            let dataHash = crypto.hash(JSON.stringify(decryptedAccount));

            if (dataHash != dataParts[1]) {
                throw new Error('Broken account. Most of time reason: invalid network');
            }

            return new Account(decryptedAccount.name, decryptedAccount.privateKey, this.provider);
        } catch (error) {
            throw new Error(`Account decryption: ${error.message}`);
        }
    }
}

let createAccountOnBlockchain = async function (accountToBeCreated, accountCreator) {
    await accountToBeCreated.provider.eos.transaction(tr => {
        tr.newaccount({
            creator: accountCreator.name,
            name: accountToBeCreated.name,
            owner: accountToBeCreated.keys['owner']['public'],
            active: accountToBeCreated.keys['active']['public']
        });
    }, { keyProvider: accountCreator.keys['active']['private'] });
}

module.exports = AccountFactory;
