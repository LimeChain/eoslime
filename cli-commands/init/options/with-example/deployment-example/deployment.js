const TOKEN_WASM_PATH = './contracts/example/eosio.token.wasm';
const TOKEN_ABI_PATH = './contracts/example/eosio.token.abi';

let deploy = async function (eoslime, deployer) {

    if (!deployer) {
        deployer = await eoslime.Account.createRandom();
    }

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