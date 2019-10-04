const eosjs = require('eosjs');
const eosECC = eosjs.modules.ecc;
const decodeName = eosjs.modules.format.decodeName;

const createAccountNameFromPublicKey = require('./../account/public-key-name-generator').createAccountNameFromPublicKey;

module.exports = {
    toName: function (encodedName) {
        return decodeName(encodedName, false);
    },
    generateName: async function () {
        const privateKey = await eosECC.randomKey();
        const publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();
        return createAccountNameFromPublicKey(publicKey);
    },
    generateKeys: async function () {
        const privateKey = await eosECC.randomKey();
        const publicKey = eosECC.PrivateKey.fromString(privateKey).toPublic().toString();

        return {
            privateKey,
            publicKey
        }
    }
}
