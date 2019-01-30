const EOS = require('eosjs');
const NETWORKS = require('./networks.json');

class EOSInstance {
    constructor(network, privateKey) {
        let currentNetwork = NETWORKS[network] || network;

        if (!currentNetwork.hasOwnProperty('url') || !currentNetwork.hasOwnProperty('chainId')) {
            throw new Error('Invalid network. You can choose from [ local, jungle, bos, worbli, main ] or { url: "Your network", chainId: "Your chainId" }');
        }

        let eos = EOS({
            httpEndpoint: currentNetwork.url,
            chainId: currentNetwork.chainId,
            keyProvider: privateKey
        });

        eos.network = currentNetwork;
        return eos;
    }
}

module.exports = EOSInstance;
