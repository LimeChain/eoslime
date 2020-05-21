const linesOption = require('./options/lines-option');

module.exports = {
    "template": "logs",
    "description": "Show last N lines from local nodeos logs",
    "options": [linesOption]
}