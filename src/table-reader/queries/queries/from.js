const QueryProp = require('../query-prop');
const attach = require('../helpers/attach-queries');

class FromQuery extends QueryProp {

    constructor() {
        super({ 'code': '', 'scope': '' });
    }

    from(contractName) {
        if (!contractName) {
            throw new Error('You should provide from argument');
        }

        this.props.code = contractName;
        this.props.scope = contractName;
        this.props.default = false;

        const queueQueries = attach({}, this.queries);
        return queueQueries;
    }
}

module.exports = FromQuery;

