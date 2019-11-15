const QueryProp = require('../query-prop');
const attach = require('../helpers/attach-queries');

class RangeQueryQuery extends QueryProp {

    constructor() {
        super({ 'lower_bound': '', 'upper_bound': '' });
    }


    range(minValue, maxValue) {
        this.props.lower_bound = minValue;
        this.props.upper_bound = maxValue;
        this.props.default = false;

        const queueQueries = attach({}, this.queries);
        return queueQueries;
    }
}

module.exports = RangeQueryQuery
