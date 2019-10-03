const Account = require('./account');

const is = require('./../helpers/is')
const eosECC = require('eosjs').modules.ecc;
const crypto = require('./../helpers/crypto');
const createAccountNameFromPublicKey = require('./public-key-name-generator').createAccountNameFromPublicKey;

const DEFAULT_AUTHORITY = 'active';

class AccountFactory {
    constructor(provider) {
        this.provider = provider;
    }

    load(name, privateKey, authorityName = DEFAULT_AUTHORITY) {
        try {
            return new Account(name, privateKey, this.provider, authorityName);
        } catch (error) {
            throw new Error('Invalid private key. Invalid checksum');
        }
    }

    async createFromName(accountName, accountCreator = this.provider.defaultAccount) {
        is(accountCreator).instanceOf(Account);

        let accountPrivateKey = await eosECC.randomKey();
        let newAccount = new Account(accountName, accountPrivateKey, this.provider, DEFAULT_AUTHORITY);

        await createAccountOnBlockchain(newAccount, accountCreator);

        return newAccount;
    }

    async createRandom(accountCreator = this.provider.defaultAccount) {
        is(accountCreator).instanceOf(Account);

        let privateKey = await eosECC.randomKey();
        let publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();
        let name = createAccountNameFromPublicKey(publicKey);

        let newAccount = new Account(name, privateKey, this.provider, DEFAULT_AUTHORITY);
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
                authority: newAccount.executiveAuthority
            };

            let dataHash = crypto.hash(JSON.stringify({ ...dataToBeEncrypted, privateKey: newAccount.privateKey }));
            let cipherText = crypto.encrypt(`${newAccount.privateKey}::${dataHash}`, password);

            return { ...dataToBeEncrypted, cipherText };
        } catch (error) {
            throw new Error(`Account encryption: ${error.message}`);
        }
    }

    fromEncrypted(encryptedAccount, password) {
        try {
            let decryptedAccount = JSON.parse(JSON.stringify(encryptedAccount));

            let pureData = crypto.decrypt(encryptedAccount.cipherText, password);
            if (!pureData) {
                throw new Error('Couldn\'t decrypt the data');
            }

            delete decryptedAccount.cipherText;

            let dataParts = pureData.split('::');
            decryptedAccount.privateKey = dataParts[0];
            decryptedAccount.network = this.provider.network;

            let dataHash = crypto.hash(JSON.stringify(decryptedAccount));

            if (dataHash != dataParts[1]) {
                throw new Error('Broken account. Most of time reason: invalid network');
            }

            return new Account(decryptedAccount.name, decryptedAccount.privateKey, this.provider, decryptedAccount.authority.permission);
        } catch (error) {
            throw new Error(`Account decryption: ${error.message}`);
        }
    }
}

const createAccountOnBlockchain = async function (accountToBeCreated, accountCreator) {
    await accountToBeCreated.provider.eos.transaction(tr => {
        tr.newaccount({
            creator: accountCreator.name,
            name: accountToBeCreated.name,
            owner: accountToBeCreated.publicKey,
            active: accountToBeCreated.publicKey
        });

        tr.buyrambytes({
            payer: accountCreator.name,
            receiver: accountToBeCreated.name,
            bytes: 8192
        });

    }, { keyProvider: accountCreator.privateKey });
}

module.exports = AccountFactory;
