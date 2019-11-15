const QueryProp = require('../query-prop');
const attach = require('../helpers/attach-queries');

class SelectQuery extends QueryProp {

    constructor() {
        super({ 'table': '' });
    }

    select(table) {
        if (!table) {
            throw new Error('You should provide select argument');
        }

        this.props.table = table;
        this.props.default = false;

        const queueQueries = attach({}, this.queries);
        return queueQueries;
    }
}

module.exports = SelectQuery;
