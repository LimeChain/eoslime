const eosECC = require('eosjs').modules.ecc;

const digitMapping = {
    '0': '1',
    '6': '2',
    '7': '3',
    '8': '4',
    '9': '5',
}


module.exports = {
    createAccountNameFromPublicKey: function (pubKey) {
        let accountHashedName = eosECC.sha256(`${pubKey}${Date.now()}`);
        let accountName = mapAccountName(`l${accountHashedName.substring(0, 11)}`);

        return accountName;
    }
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