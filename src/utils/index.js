const eosjs = require('eosjs');
const eosECC = eosjs.modules.ecc;
const decodeName = eosjs.modules.format.decodeName;


module.exports = {
    toName: function (encodedName) {
        return decodeName(encodedName, false);
    },
    randomName: async function () {
        const privateKey = await eosECC.randomKey();
        const publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();
        return createAccountNameFromPublicKey(publicKey);
    },
    nameFromPrivateKey: async function (privateKey) {
        const publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();
        return createAccountNameFromPublicKey(publicKey);
    },
    randomPrivateKey: async function () {
        return eosECC.randomKey();
    },
    generateKeys: async function () {
        const privateKey = await this.randomPrivateKey();
        const publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();

        return {
            privateKey,
            publicKey
        }
    }
}


const digitMapping = {
    '0': '1',
    '6': '2',
    '7': '3',
    '8': '4',
    '9': '5',
}

const createAccountNameFromPublicKey = function (pubKey) {
    const accountHashedName = eosECC.sha256(`${pubKey}${Date.now()}`);
    return mapAccountName(`l${accountHashedName.substring(0, 11)}`);
}

const mapAccountName = function (accountName) {
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