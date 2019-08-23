const pathOption = require('./options/path-option');
const networkOption = require('./options/network-option');
const contractAccountOption = require('./options/contract-account-option');

module.exports = {
    "template": "deploy [path] [network] [contractAccount]",
    "description": "Run deployment script",
    options: [pathOption, networkOption, contractAccountOption]
}
