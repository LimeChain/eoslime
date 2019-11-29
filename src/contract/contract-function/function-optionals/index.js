const fromOptional = require("./from");
const uniqueOptional = require("./unique");
const tokensOptional = require('./tokens');

module.exports = {
    from: fromOptional,
    unique: uniqueOptional,
    tokens: tokensOptional,
    all: [fromOptional, uniqueOptional, tokensOptional]
};
