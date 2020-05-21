const TOKEN_WASM_PATH = './contracts/example/eosio.token.wasm';
const TOKEN_ABI_PATH = './contracts/example/eosio.token.abi';

let deploy = async function (eoslime, deployer) {

    if (!deployer) {
        deployer = await eoslime.Account.createRandom();
    }

    const tokenContract = await eoslime.Contract.deployOnAccount(TOKEN_WASM_PATH, TOKEN_ABI_PATH, deployer);
    console.log(tokenContract.name);
}

module.exports = deploy;