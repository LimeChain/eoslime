// {
//     "template": "test [path] [network] [accounts]",
//     "description": "Run tests",
//     "options": [
//         {
//             "name": "path",
//             "definition": {
//                 "describe": "Path to the test file/folder",
//                 "type": "string",
//                 "default": "./tests/"
//             }
//         },
//         {
//             "name": "network",
//             "definition": {
//                 "describe": "Blockchain network on which you are going to execute your tests",
//                 "type": "string",
//                 "default": "local",
//                 "choices": [
//                     "local",
//                     "jungle",
//                     "main"
//                 ]
//             }
//         },
//         {
//             "name": "accounts",
//             "definition": {
//                 "describe": "Provide accounts names which will be prepared for you and be globally accessible in your tests",
//                 "type": "array"
//             }
//         }
//     ]
// }

// const pathOption = require('./options/path/path-option');
// const networkOption = require('./options/network/network-option');
// const accountsOption = require('./options/account/accounts-option');

module.exports = {
    "template": "test [path] [network] [accounts]",
    "description": "Run tests",
    "options": [] //pathOption, networkOption, accountsOption]
}