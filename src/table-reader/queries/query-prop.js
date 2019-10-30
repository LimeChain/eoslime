class QueryProp {

    constructor(props) {
        this.props = Object.assign({}, props, { default: true });
        this.queries = [];
    }

    push(queries) {
        for (let i = 0; i < queries.length; i++) {
            this.queries.push(queries[i]);
        }
    }
}

module.exports = QueryProp;

