const FromQuery = require('./from')
const RangeQuery = require('./range');
const LimitQuery = require('./limit');
const ScopeQuery = require('./scope');
const SelectQuery = require('./select');
const EqualQuery = require('./equal-to');
const IndexQuery = require('./by-index');

module.exports = {
    FromQuery,
    RangeQuery,
    LimitQuery,
    ScopeQuery,
    SelectQuery,
    EqualQuery,
    IndexQuery
}