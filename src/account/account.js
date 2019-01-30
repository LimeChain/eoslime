const eosECC = require('eosjs').modules.ecc;

const Networks = require('./../helpers/networks.json');
const EOSInstance = require('./../helpers/eos-instance');

class Account {

    constructor(name, privateKey) {
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

        this.publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();
        this.privateKey = privateKey
    }

    static async createFromName(accountName, accountCreator = defaultAccountCreator, network = 'local') {
        validateAccountCreator(accountCreator);

        let accountPrivateKey = await eosECC.randomKey();
        let newAccount = new Account(accountName, accountPrivateKey);

        await createAccountOnNetwork(newAccount, accountCreator, network);

        return newAccount;
    }

    static async createRandom(accountCreator = defaultAccountCreator, network = 'local') {
        validateAccountCreator(accountCreator);

        let accountPrivateKey = await eosECC.randomKey();
        let accountPublicKey = eosECC.PrivateKey.fromString(accountPrivateKey).toPublic().toString();
        let accountName = createAccountNameFromPublicKey(accountPublicKey);

        let newAccount = new Account(accountName, accountPrivateKey);
        await createAccountOnNetwork(newAccount, accountCreator, network);

        return newAccount;
    }

    static async createRandoms(accountsCount, accountCreator = defaultAccountCreator, network = 'local') {

        let accounts = [];
        for (let i = 0; i < accountsCount; i++) {
            let newAccount = await Account.createRandom(accountCreator, network);

            accounts.push(newAccount);
        }

        return accounts;
    }

    static createEncrypted(password) {

    }

    static fromEncryptedJson(json, password) {

    }
}

const defaultAccount = require('./../defaults/account-default');
const defaultAccountCreator = new Account(defaultAccount.name, defaultAccount.privateKey);

let validateAccountCreator = function (accountCreator) {
    if (!(accountCreator instanceof Account)) {
        throw new Error('Account creator is not an instance of Account');
    }
}

let createAccountOnNetwork = async function (accountToBeCreated, accountCreator, network) {
    let eosInstance = new EOSInstance(Networks[network], accountCreator.privateKey);

    await eosInstance.transaction(tr => {
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

        tr.delegatebw({
            from: accountCreator.name,
            receiver: accountToBeCreated.name,
            stake_net_quantity: '10.0000 SYS',
            stake_cpu_quantity: '10.0000 SYS',
            transfer: 0
        });
    });
}

let createAccountNameFromPublicKey = function (pubKey) {
    let accountHashedName = eosECC.sha256(`${pubKey}${Date.now()}`);
    let accountName = mapAccountName(`l${accountHashedName.substring(0, 11)}`);

    return accountName;
}

const digitMapping = {
    '0': '1',
    '6': '2',
    '7': '3',
    '8': '4',
    '9': '5',
}

let mapAccountName = function (accountName) {
    let mappedName = '';
    for (let i = 0; i < accountName.length; i++) {
        if (digitMapping[accountName[i]]) {
            mappedName += digitMapping[accountName[i]];
        } else {
            mappedName += accountName[i];
        }
    }

    return mappedName;
}

module.exports = Account;
