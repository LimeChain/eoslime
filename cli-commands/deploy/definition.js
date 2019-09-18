const pathOption = require('./options/path-option');
const networkOption = require('./options/network-option');
const deployerOption = require('./options/deployer-option');

module.exports = {
    "template": "deploy [path] [network] [deployer]",
    "description": "Run deployment script",
    options: [pathOption, networkOption, deployerOption]
}
