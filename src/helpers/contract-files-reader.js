const fs = require('fs');

module.exports = {
    readABIFromFile: function (abiPath) {
        return JSON.parse(fs.readFileSync(abiPath));
    },
    readWASMFromFile: function (wasmPath) {
        return fs.readFileSync(wasmPath);
    }
}
