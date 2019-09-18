const pathOption = require('./options/path-option');
const resourceReport = require('./options/resource-report-option');

module.exports = {
    "template": "test [path] [resource-report]",
    "description": "Run tests",
    "options": [pathOption, resourceReport]
}