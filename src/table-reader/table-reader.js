const Queries = require('./queries/queries');
const QueryProcessor = require('./queries/query-chain-processor/query-processor');

class TableReader {

    constructor(eosProvider) {
        this.allQueries = {};
        this.provider = eosProvider;
    }

    select(table) {
        const readerAddon = new TableReader(this.provider);
        const selectQuery = generateQueriesChain(readerAddon);
        return selectQuery.select(table);
    }
}

const generateQueriesChain = function (readerAddon) {
    readerAddon.allQueries = {
        fromQuery: new Queries.FromQuery(),
        rangeQuery: new Queries.RangeQuery(),
        limitQuery: new Queries.LimitQuery(),
        indexQuery: new Queries.IndexQuery(),
        equalQuery: new Queries.EqualQuery(),
        selectQuery: new Queries.SelectQuery(),
    }

    const queryProcessor = buildQueryProcessor(readerAddon.provider, readerAddon.allQueries);

    readerAddon.allQueries.selectQuery.push([readerAddon.allQueries.fromQuery]);
    readerAddon.allQueries.fromQuery.push([readerAddon.allQueries.indexQuery, readerAddon.allQueries.limitQuery, readerAddon.allQueries.rangeQuery, readerAddon.allQueries.equalQuery, queryProcessor]);
    readerAddon.allQueries.limitQuery.push([readerAddon.allQueries.indexQuery, readerAddon.allQueries.rangeQuery, readerAddon.allQueries.equalQuery, queryProcessor]);
    readerAddon.allQueries.indexQuery.push([readerAddon.allQueries.limitQuery, readerAddon.allQueries.rangeQuery, readerAddon.allQueries.equalQuery, queryProcessor]);
    readerAddon.allQueries.rangeQuery.push([readerAddon.allQueries.indexQuery, readerAddon.allQueries.limitQuery, queryProcessor]);
    readerAddon.allQueries.equalQuery.push([readerAddon.allQueries.indexQuery, readerAddon.allQueries.limitQuery, queryProcessor]);

    return readerAddon.allQueries.selectQuery
}

const buildQueryProcessor = function (provider, processableQueries) {
    return new QueryProcessor(provider, processableQueries);
}

module.exports = TableReader;
