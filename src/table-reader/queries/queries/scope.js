const QueryProp = require('../query-prop');
const attach = require('../helpers/attach-queries');

class ScopeQuery extends QueryProp {

    constructor() {
        super({ 'scope': '' });
    }

    scope(accountName) {
        if (!accountName) {
            throw new Error('You should provide scope argument');
        }

        console.log(accountName)
        this.props.scope = accountName;
        this.props.default = false;

        const queueQueries = attach({}, this.queries);
        return queueQueries;
    }
}

module.exports = ScopeQuery;
