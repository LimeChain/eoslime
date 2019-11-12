const MultiSignatureAccount = require('./account');

const DEFAULT_AUTHORITY = 'active';

class MultiSignatureFactory {

    constructor(provider) {
        this.provider = provider;
    }

    load(name, privateKey, authorityName = DEFAULT_AUTHORITY) {
        try {
            return new MultiSignatureAccount(name, privateKey, this.provider, authorityName);
        } catch (error) {
            throw new Error('Invalid private key. Invalid checksum');
        }
    }
}

module.exports = MultiSignatureFactory;
