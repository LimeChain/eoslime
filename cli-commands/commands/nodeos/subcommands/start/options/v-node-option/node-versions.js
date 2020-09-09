module.exports = {
    vdefault: (path) => {
        return `nodeos -e -p eosio --plugin eosio::producer_plugin --plugin eosio::producer_api_plugin --plugin eosio::chain_api_plugin --plugin eosio::http_plugin --plugin eosio::history_plugin --plugin eosio::history_api_plugin -d ${path}/data --config-dir ${path}/config --access-control-allow-origin="*" --p2p-listen-endpoint="0.0.0.0:3001" --contracts-console --verbose-http-errors --http-validate-host=false --filter-on="*" >> ${path}/nodeos.log 2>&1 & echo $! > ${path}/eosd.pid && sleep 2s`
    },
    v207: (path) => {
        return `nodeos -e --plugin eosio::chain_plugin  --plugin eosio::chain_api_plugin --plugin eosio::producer_plugin --plugin eosio::producer_api_plugin --plugin eosio::http_plugin -d ${path}/data --config-dir ${path}/config --access-control-allow-origin="*" --p2p-listen-endpoint="0.0.0.0:3001" --contracts-console --verbose-http-errors --http-validate-host=false >> ${path}/nodeos.log 2>&1 & echo $! > ${path}/eosd.pid && sleep 2s`
    }
}
