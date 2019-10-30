const QueryProp = require('../query-prop');
const attach = require('../helpers/attach-queries');

class IndexQuery extends QueryProp {

    // This is the default index with key type
    constructor() {
        super({ 'index_position': 1, 'key_type': 'i64' });
    }

    index(index, keyType) {
        this.props.index_position = index;
        this.props.key_type = keyType || this.props.key_type;
        this.props.default = false;

        const queueQueries = attach({}, this.queries);
        return queueQueries;
    }
}

module.exports = IndexQuery;

