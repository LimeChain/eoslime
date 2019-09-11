const fromOptional = require("./from");
const uniqueOptional = require("./unique");

module.exports = {
    from: fromOptional,
    unique: uniqueOptional,
    all: [fromOptional, uniqueOptional]
};
