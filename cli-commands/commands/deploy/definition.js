const pathOption = require('./options/path-option');
const networkOption = require('./options/network-option');
const deployerOption = require('./options/deployer-option');

module.exports = {
    "template": "deploy",
    "description": "Run deployment script/s",
    options: [pathOption, networkOption, deployerOption]
}
