const eosECC = require('eosjs').modules.ecc;
const Account = require('./account');

const defineImmutableProperties = require('./../helpers/immutable-properties').defineImmutableProperties;

class AccountsLoader {

    constructor(eos, accountsCreator) {
        defineImmutableProperties(this, [
            { name: 'eos', value: eos },
            { name: 'accountsCreator', value: accountsCreator },
        ]);
    }

    async load(accountsCount = 1) {
        let accounts = [];
        for (let i = 0; i < accountsCount; i++) {
            let accPrivateKey = await eosECC.randomKey();
            let accPublicKey = eosECC.PrivateKey.fromString(accPrivateKey).toPublic().toString();
            let accountName = await createAccountNameFromPubKey(accPublicKey);

            let newAccount = new Account(accountName, accPublicKey, accPrivateKey);

            await setupAccount.call(this, newAccount);
            accounts.push(newAccount);
        }

        return accounts;
    }
}

module.exports = AccountsLoader;


let createAccountNameFromPubKey = async function (pubKey) {
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

let setupAccount = async function (account) {
    await this.eos.transaction(tr => {
        tr.newaccount({
            creator: this.accountsCreator.name,
            name: account.name,
            owner: account.publicKey,
            active: account.publicKey
        });

        tr.buyrambytes({
            payer: this.accountsCreator.name,
            receiver: account.name,
            bytes: 8192
        });

        tr.delegatebw({
            from: this.accountsCreator.name,
            receiver: account.name,
            stake_net_quantity: '10.0000 SYS',
            stake_cpu_quantity: '10.0000 SYS',
            transfer: 0
        });
    })
}
