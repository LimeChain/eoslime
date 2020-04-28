const accountsOption = require('./options/accounts-option/accounts-option');
const logsOption = require('./options/logs-option');

module.exports = {
    "template": "show [accounts] [logs]",
    "description": "Show local node details",
    "options": [accountsOption, logsOption]
}