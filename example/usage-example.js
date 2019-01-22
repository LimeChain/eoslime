const eoslime = require('./../utils/eoslime/index');

const network = 'http://127.0.0.1:8888';
const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';

const contractAccount = 'leca3a3cfe35';
const privateKey = '5KXwB6VTwjzKgEiGoNikfyH8WHf4ouGYDCgQWZJda1389ZFeuEq';

const fs = require('fs');
const path = require('path');
const abi = fs.readFileSync(path.join(__dirname, 'Your Contract API path'));
const wasm = fs.readFileSync(path.join(__dirname, '.Your Contract WAS, path'));

describe("Usage", async () => {

    it("Should instantiate deployers", async () => {
        let cleanDeployer = new eoslime.CleanDeployer(network, chainId);
        let cleanContract = await cleanDeployer.deploy(wasm, abi);
        console.log(cleanContract.deployer);

        let accDeployer = new eoslime.AccountDeployer(network, chainId);
        let accContract = await accDeployer.deploy(wasm, abi, contractAccount, privateKey);
        console.log(accContract);
    });
});
