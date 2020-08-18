[![npm version](https://badge.fury.io/js/eoslime.svg)](https://badge.fury.io/js/eoslime.svg) 
[![codecov](https://codecov.io/gh/LimeChain/eoslime/branch/master/graph/badge.svg)](https://codecov.io/gh/LimeChain/eoslime)

eoslime.js
============

EOS development and deployment framework based on eosjs.js. The framework's main purpose is to make the process of unit testing, deployment and compilation much simpler and much easier.

Telegram - https://t.me/eoslime   
Documentation - https://lyubo.gitbook.io/eoslime/




# Contributors
Thanks these wonderful people for helping improve EOSLime


<table>
<tr>
    <td align="center"><a href="https://github.com/vladichhh"><img src="https://avatars0.githubusercontent.com/u/6073094?s=400&u=082c73ab35e0227f16679edab6bcde05ccde37c3&v=4" width="100px;" alt=""/><br/><sub><b>Kristian Veselinov</b></sub></a><br/><a href="#" title="Management">🧭</a><a href="#" title="Marketing">🚀</a></td>
    <td align="center"><a href="https://github.com/vladichhh"><img src="https://avatars0.githubusercontent.com/u/31288155?s=400&u=80cbd54d1c973ebac1f443230e4a07a9a0bca7a2&v=4" width="100px;" alt=""/><br/><sub><b>Vladimir Hristov</b></sub></a><br/><a href="#" title="Code">💻</a><a href="#" title="Maintenance">🚧</a><a href="#" title="Ideas">💡</a></td>
    <td align="center"><a href="https://github.com/Avm07"><img src="https://avatars1.githubusercontent.com/u/24969602?s=400&u=c2ab916dba523284faa1310b363fed7ef27634f2&v=4" width="100px;" alt=""/><br/><sub><b>Artem</b></sub></a><br/>
    <a href="https://github.com/LimeChain/eoslime/issues/53" title="Ideas">💡</a>
    </td>
</tr>
</table>



# Change log

## Version 1.0.4 change log

* **eoslime nodeos**      
    * **eoslime nodeos start --path="Some path"**   
    Run local predefined single node chain
    * **eoslime nodeos stop**    
    Stop single node chain started by **eoslime nodeos start**   
    * **eoslime nodeos accounts**    
    Show preloaded accounts on **eoslime nodeos start**     
    * **eoslime nodeos logs**     
    Show chain logs

* **Account.create(name, privateKey, ?creator)**
There are cases you have already generated your private key and you have a name for your account. You only need to create it on the chain.

* **Contract.deployRaw(rawWasm, abiJSON, ?options)**    
Used for deploying a contract from WASM string and ABI in JSON format
A typical use case for `deployRaw` is in CI/CD. You don't want to compile your contract every time, however your tests needs WASM and ABI. A good approach is to deploy your contract on a test network like Jungle one and retrieve its WASM and ABI for your tests.
    ```javascript
    const eoslime = eoslime.init('jungle');
    const deployedContract = 'your_contract_name'; 
    const contractA_ABI = await eoslime.Provider.getABI(deployedContract);
    const contractA_WASM = await eoslime.Provider.getRawWASM(deployedContract);
        
    const contractB = await eoslime.Contract.deployRaw(contractA_WASM, contractA_ABI); 
    ```
* **Contract.deployRawOnAccount(rawWasm, abiJSON, account, ?options)**     
Used for deploying a contract from WASM string and ABI in JSON format

* **Provider.getABI(contractName)**    
Returns contract ABI in JSON format

* **Provider.getRawWASM(contractName)**     
Returns raw WASM useful for deploying another contract directly

* **contractInstance.abi**     
Returns contract ABI in JSON format

* **contractInstance.getRawWASM()**     
Returns contract raw WASM


## Version 1.0.3 change log

* **eoslime shape --framework=react**    
A shape represents a simple full project. It includes a contract, tests, deployments and user interface. The idea of that project is for developers to have a ready solution they could start to build on top.    
<br>React Project implementation - https://github.com/LimeChain/eoslime-shape-react

## Version 1.0.2 change log

* **Fix ABI Parsing** - https://github.com/LimeChain/eoslime/issues/37
* **Fix describe.only** - mocha describe.only behaviour has broken with `eoslime test` 
* **Add more flexibility in eoslime initialization**
EOSLIME was able to be initialized only with pre-configured providers connections. Now you can connect eoslime to your chain and keep the pre-configured functionality as the **default account on local network**
    ```javascript
    // New local flexible initialization
    const eoslime = require('eoslime').init('local', { url: 'Your url', chainId: 'Your chainId' });
    const eoslime = require('eoslime').init('jungle', { url: 'Your url', chainId: 'Your chainId' });
    const eoslime = require('eoslime').init('bos', { url: 'Your url', chainId: 'Your chainId' });
    // ... any other supported netwok ...
    ```
* **Allow read-only contracts** - You are able now to instantiate a contract without a signer/executor and read the contract's tables
* **Add Tutorial section in the documentation**
* **Describe how examples in the documentation could be run**
* **Increase the code coverage from 46% to 90+ %**

## Version 1.0.1 change log

* **Token** option was added
There are cases, where you need to execute a contract function and pay some tokens, but this could be done by processing two transactions. The first one is to your contract, the second one is to eosio.token contract. But what about if the tokens transfer reverts and the transaction to your contract is successful. That is what payable contract actions are purposed for. You should be able to execute an atomic transaction constructed by both actions above.
```javascript
// Local network initialization
const eoslime = require('eoslime').init();

const CONTRACT_NAME = 'mycontract';
const ABI_PATH = './contract/contract.abi';

// Pre-created local network accounts
const user1 = eoslime.Account.load('myacc1', 'privateKey1');

let contract = eoslime.Contract.at(ABI_PATH, CONTRACT_NAME, user1);

// Execute `doSmth` and transfer 5.0000 SYS tokens to the contract at once(atomically)
await contract.doSmth('Your args here', { from: user1, tokens: '5.0000 SYS' });
```

* **Scope** was added to the table query chain
If you skip scope, the default one will be set to the from
```javascript
await Provider.select('table').from('contract name').scope('account name').find()
```
