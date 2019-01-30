const accountOption = require('./../options/account-option');
const networkOption = require('./../../global-options/network-option');

module.exports = {
    "template": "deploy-fresh <account> [network]",
    "description": "Deploy everything from contract folder on new accounts",
    "options": [accountOption, networkOption]
}