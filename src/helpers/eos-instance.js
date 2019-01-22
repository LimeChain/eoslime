const EOS = require('eosjs');

class EOSInstance {
    constructor(network, chainId, privateKey) {
        return EOS({
            httpEndpoint: network,
            chainId: chainId,
            keyProvider: privateKey
        });
    }
}

module.exports = EOSInstance;
