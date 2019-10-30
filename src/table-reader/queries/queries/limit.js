const QueryProp = require('../query-prop');
const attach = require('../helpers/attach-queries');

class LimitQuery extends QueryProp {

    // This is the default limit
    constructor() {
        super({ 'limit': 1 });
    }

    limit(limit) {
        this.props.limit = limit;
        this.props.default = false;

        const queueQueries = attach({}, this.queries);
        return queueQueries;
    }
}

module.exports = LimitQuery;
