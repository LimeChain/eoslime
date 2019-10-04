const TOKEN_WASM_PATH = './contracts/example/eosio.token.wasm';
const TOKEN_ABI_PATH = './contracts/example/eosio.token.abi';

let deploy = async function (eoslime, deployer) {

    if (!deployer) {
        deployer = await eoslime.Account.createRandom();
    }

    let tokenContract = await eoslime.Contract.deployWithAccount(TOKEN_WASM_PATH, TOKEN_ABI_PATH, deployer);
}

module.exports = deploy;