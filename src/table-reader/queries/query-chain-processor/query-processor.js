const QueryProp = require("../query-prop");

class QueryProcessor extends QueryProp {


    constructor(provider, queryProps) {
        super()
        this.provider = provider;
        this.queryProps = queryProps;
    }

    async find() {
        const queryData = {};

        for (const queryPropName in this.queryProps) {
            const queryProp = this.queryProps[queryPropName];

            for (const prop in queryProp.props) {
                if (!queryData[prop]) {
                    queryData[prop] = queryProp.props[prop];
                }

                if (queryData[prop] && !queryProp.props.default) {
                    queryData[prop] = queryProp.props[prop];
                }
            }
        }

        return (await this.provider.getTableRows({
            ...queryData,
            json: true
        })).rows
    }
}

module.exports = QueryProcessor;
