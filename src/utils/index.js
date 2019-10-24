const eosjs = require('eosjs');
const eosECC = eosjs.modules.ecc;
const decodeName = eosjs.modules.format.decodeName;

const createAccountNameFromPublicKey = require('./../account/public-key-name-generator').createAccountNameFromPublicKey;

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
