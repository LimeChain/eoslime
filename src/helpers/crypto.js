const cryptoJS = require('crypto-js');

// module.exports = {
//     encrypt: function (account, password) {
//         try {
//             let dataToBeEncrypted = JSON.stringify({
//                 data
//             });

//             let dataHash = hashAccount(dataToBeEncrypted);
//             let ciphertext = encryptAccountData(`${data.privateKey}::${dataHash}`, password);

//             return JSON.stringify({
//                 ...data,
//                 ciphertext
//             });
//         } catch (error) {
//             throw new Error(`Account encryption: ${error.message}`);
//         }
//     },
//     decrypt: function (encryptedAccount, password) {
//         try {
//             let decryptedAccount = JSON.parse(JSON.stringify(encryptedAccount));
//             delete decryptedAccount.ciphertext;

//             let pureData = decryptedAccountData(encryptedAccount.ciphertext, password);
//             let dataParts = pureData.split('::');

//             decryptedAccount.privateKey = dataParts[0];
//             let dataHash = hashAccount(decryptedAccount);

//             if (dataHash != dataParts[1]) {
//                 throw new Error('Broken account. Most of time reason: invalid network');
//             }

//             return decryptedAccount.privateKey;
//         } catch (error) {
//             throw new Error(`Account decryption: ${error.message}`);
//         }
//     }
// }

module.exports = {
    hash: function (data) {
        try {
            let dataHash = cryptoJS.SHA256(data).toString(cryptoJS.enc.Hex);
            return dataHash;
        } catch (error) {
            throw new Error('Couldn\'t hash the data')
        }
    },
    encrypt: function (data, password) {
        try {
            let encryptedData = cryptoJS.AES.encrypt(data, password).toString();
            return encryptedData;
        } catch (error) {
            throw new Error('Couldn\'t encrypt the data');
        }
    },
    decrypt: function (encryptedData, password) {
        try {
            let decryptedData = cryptoJS.AES.decrypt(encryptedData, password).toString(cryptoJS.enc.Utf8);
            return decryptedData;
        } catch (error) {
            throw new Error('Couldn\'t decrypt the data');
        }
    }
}

