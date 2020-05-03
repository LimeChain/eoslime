const pathOption = require('./options/path-option');
const linesOption = require('./options/lines-option');

module.exports = {
    "template": "logs [path] [lines]",
    "description": "Lists last N lines from node logs",
    "options": [pathOption, linesOption]
}