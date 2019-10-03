const pathOption = require('./options/path-option');
const networkOption = require('./options/network-option');
const resourceReportOption = require('./options/resource-usage-option/resource-usage-option');

module.exports = {
    "template": "test [path] [network] [resource-usage]",
    "description": "Run tests",
    "options": [pathOption, networkOption, resourceReportOption]
}