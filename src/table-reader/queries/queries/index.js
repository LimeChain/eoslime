const FromQuery = require('./from')
const RangeQuery = require('./range');
const LimitQuery = require('./limit');
const SelectQuery = require('./select');
const EqualQuery = require('./equal-to');
const IndexQuery = require('./by-index');

module.exports = {
    FromQuery,
    RangeQuery,
    LimitQuery,
    SelectQuery,
    EqualQuery,
    IndexQuery
}