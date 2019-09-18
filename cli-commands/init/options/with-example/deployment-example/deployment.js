
const path = require('path');


const TOKEN_WASM_PATH = path.join(__dirname, './contract/example/eosio.token.wasm');
const TOKEN_ABI_PATH = path.join(__dirname, './contract/example/eosio.token.abi');

let deploy = async function (eoslime, deployer) {

    /*
        Deploy command example:
            
            eoslime deploy ./deployment/example-deploy.js network='local' account="{name:\"myAcc\", privateKey:\"myPrivateKey\"}" 
            
        Will provide to the deploy function:
            1. Instantiated eoslime
            2. deployer -> eoslime.Account
    */
    let tokenContract = await eoslime.AccountDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH, deployer);
}

module.exports = deploy;