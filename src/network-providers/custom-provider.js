const BaseProvider = require('./base-provider');

class CustomProvider extends BaseProvider {
    constructor(networkConfig) {
        if (!networkConfig.hasOwnProperty('url') || !networkConfig.hasOwnProperty('chainId')) {
            throw new Error('Invalid network. Custom network should have { url: "Your network", chainId: "Your chainId" }');
        }

        const CustomNetworkConfig = {
            name: 'custom',
            url: '',
            chainId: ''
        }

        CustomNetworkConfig.url = networkConfig.url;
        CustomNetworkConfig.chainId = networkConfig.chainId;

        super(CustomNetworkConfig)
    }
}

module.exports = CustomProvider
