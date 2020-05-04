const pathOption = require('./options/path-option');
const pidOption = require('./options/pid-option');

module.exports = {
    "template": "stop [path] [pid]",
    "description": "Stop a local node",
    "options": [pathOption, pidOption]
}
