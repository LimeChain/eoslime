const pathOption = require('./options/path-option');
const vNodeOption = require('./options/v-node-option');

module.exports = {
    "template": "start",
    "description": "Start local nodeos",
    "options": [pathOption, vNodeOption]
}
