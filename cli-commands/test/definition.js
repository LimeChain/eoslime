const pathOption = require('./options/path-option');
const networkOption = require('./options/network-option');
const resourceReportOption = require('./options/resource-report-option/resource-report-option');

module.exports = {
    "template": "test [path] [network] [resource-report]",
    "description": "Run tests",
    "options": [pathOption, networkOption, resourceReportOption]
}