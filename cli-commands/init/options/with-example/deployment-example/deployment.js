
const path = require('path');
const eoslimeTool = require('eoslime')


const TOKEN_WASM_PATH = path.join(__dirname, './contract/example/eosio.token.wasm');
const TOKEN_ABI_PATH = path.join(__dirname, './contract/example/eosio.token.abi');

let deploy = async function (network, deployer) {

    /*
        Deploy command example:
            
            eoslime deploy ./deployment/example-deploy.js network='local' account="{name:\"myAcc\", privateKey:\"myPrivateKey\"}" 
            
        Will provide to the deploy function:
            1. network object -> {
                    url: localhost url
                    chain: localhost chainID 
                }

            2. deployer -> eoslime.Account
    */
    const eoslime = eoslimeTool.init({ network: network.url, chainId: network.chain });

    let tokenContract = await eoslime.AccountDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH, deployer);
}

module.exports = deploy;