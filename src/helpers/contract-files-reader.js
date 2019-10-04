const fs = require('fs');
const path = require('path');
const isInvalidPath = require('is-invalid-path');

module.exports = {
    readABIFromFile: function (abiPath) {
        return JSON.parse(fs.readFileSync(path.resolve(abiPath)));
    },
    readWASMFromFile: function (wasmPath) {
        return fs.readFileSync(wasmPath);
    },
    doesAbiExists: function (abi) {
        return !isInvalidPath(abi);
    }
}
