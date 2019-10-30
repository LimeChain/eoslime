const QueryProp = require('../query-prop');
const attach = require('../helpers/attach-queries');

class EqualQuery extends QueryProp {

    constructor() {
        super({ 'lower_bound': '', 'upper_bound': '' });
    }

    equal(value) {
        this.props.lower_bound = value;
        this.props.upper_bound = value;
        this.props.default = false;

        const queueQueries = attach({}, this.queries);
        return queueQueries;
    }
}

module.exports = EqualQuery;

