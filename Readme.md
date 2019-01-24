eoslime.js
============

EOS development and deployment framework based on eosjs.js

## Installing 
---

```
npm install --save eoslime
```

Simple start

```javascript
const eoslimeTool = require('eoslime');

const network = 'http://127.0.0.1:8888';
const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';
const defaultAccount = new eoslimeTool.Account('name', 'publicKey', 'privateKey');

const eoslime = eoslimeTool.init({ network: network, chaindId: chaindId, defaultAccount: defaultAccount });

const TOKEN_WASM_PATH = path.join(__dirname, './contract/eosio.token.wasm');
const TOKEN_ABI_PATH = path.join(__dirname, './contract/eosio.token.abi');

// Generate and setup freshly new accounts for usage
let accounnt = await eoslime.AccountsLoader.load(2);
let tokensIssuer = accounts[0];
let tokensHolder = accounts[1];

// Deploy contract (localhost)
let tokenContract = await eoslime.AccountDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);

// Call contract functions
// By default contract account executes methods calls on the blockchain
await tokenContract.create(tokensIssuer.name, '100 SYS');

// Change the execution account 
await tokenContract.issue(tokensHolder.name, '10 SYS', 'memo', { from: tokensIssuer });
```

## Eoslime initialization
---
***Parameters purpose***
* network - endpoint for connecting
* chainId - network chain id
* defaultAccount - It serves in three ways 
    * As a creator of another accounts ([Accounts Loader](#accounts-loader))
    * In **[`eoslime.AccountDeployer.deploy(wasmPath, abiPath, contractAccount)`](#account-deployer)** as default parameter for **`contractAccount`**
    * In **[`eoslime.Contract(abiPath, contractName, contractExecutor)`](#contract)** as default parameter for **`contractExecutor`**

---

Initialization with default parameters:
```javascript
const eoslime = require('eoslime').init();
```

***Defaults***:
* network - `http://127.0.0.1:8888`
* chainId - `cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f`
* defaultAccount 
```javascript
Account {
    name: 'eosio',
    permissions: {
        active: { actor: 'eosio', permission: 'active' }
        owner: { actor: 'eosio', permission: 'owner' }
    }
    publicKey: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
    privateKey: '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'
}
```
Initialization in another network:
```javascript
const eoslimeTool = require('eoslime');

let jungleNet = 'https://jungle2.cryptolions.io';
let jungleChainId = 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473';
const jungleAccount = new eoslimeTool.Account('name', 'publicKey', 'privateKey');

const eoslime = eoslimeTool.init({ network: jungleNet, chaindId: jungleChainId, defaultAccount: jungleAccount });
```

## Account
---
Account is some kind of container for all information an EOS account has. 
```javascript
const eoslime = require('eoslime');

let account = new eoslime.Account('eosio', 'publicKey', 'privateKey');
/*
    {
        name: 'eosio',
        permissions: {
            active: { actor: 'eosio', permission: 'active' }
            owner: { actor: 'eosio', permission: 'owner' }
        }
        publicKey: 'publicKey',
        privateKey: 'privateKey'
    }
/*
```
***Important! If eoslime function accepts account parameter, it should be an instance of `eoslime.Account`***

## Accounts Loader
---
Accounts Loader generates for you freshly new accounts which are set up and ready for use. 
```javascript
const eoslime = require('eoslime').init();

let accounts = await eoslime.AccountsLoader.load(2);
```

***Important!***
The creator of these accounts is the [`defaultAccount`](#eoslime-initialization) you have passed on initialization.   

Accounts are preset with the following:
* RAM - `8192 bytes` 
* Stake of network quantity - `10.0000 SYS`
* Stake of cpu quantity - `10.0000 SYS`

**Both the RAM buyer and the bandwidth delegate are the same [`defaultAccount`](#eoslime-initialization)**

You could use the Accounts Loader to prepare only one account as:

```javascript
const eoslime = require('eoslime').init();

let oneAccount = (await eoslime.AccountsLoader.load())[0];
```

## Deployers
---
### Account Deployer
Account Deployer is used when you already have an account on which you want to deploy a new contract or when you have an account with already deployed contract and you want to upgrade it.

***Deploy contract on provided account:***
```javascript
const eoslime = require('eoslime').init();

const WASM_PATH = path.join(__dirname, './contract/contract.wasm');
const ABI_PATH = path.join(__dirname, './contract/contract.abi');

let contractAccount = (await eoslime.AccountsLoader.load())[0];

let contract = await eoslime.AccountDeployer.deploy(WASM_PATH, ABI_PATH, contractAccount);
```

***Deploy contract on default account:***
```javascript
const eoslimeTool = require('eoslime');
const defaultContractAccount = new eoslimeTool.Account('name', 'publicKey', 'privateKey');
const eoslime = eoslimeTool.init({ defaultAccount: defaultContractAccount });

const WASM_PATH = path.join(__dirname, './contract/contract.wasm');
const ABI_PATH = path.join(__dirname, './contract/contract.abi');

let contract = await eoslime.AccountDeployer.deploy(WASM_PATH, ABI_PATH);
```
If you don't provide a contract account to the deploy function, the [`defaultContractAccount`](#eoslime-initialization) will be the account on which the contract will be deployed.

The `deploy` function returns to you a ready to use [instance](#contract) of the deployed contract.

### Clean Deployer
Clean Deployer is used when you don't have a contract account. It creates for you a new contract account on which the contract is deployed after that. The creator of the new contract account is the [`defaultAccount`](#eoslime-initialization). 
In this way the Clean Deployer always deploys a contract on a new account. 

This brings convince in the following scenario for example:   
We have two tests and one contract account. The first test writes to the contract storage, but you need this storage to be clear for the second test due to some assertions or something like that.
```javascript
const eoslime = require('eoslime').init();

const WASM_PATH = path.join(__dirname, './contract/contract.wasm');
const ABI_PATH = path.join(__dirname, './contract/contract.abi');

let contract = await eoslime.CleanDeployer.deploy(WASM_PATH, ABI_PATH);
```

The `deploy` function returns to you a ready to use [instance](#contract) of the deployed contract.

## Contract
---
You can get a contract instance in two ways
* Each Deployer returns to you a new contract after deployment
* You can instatiate an already existing contract as:
```javascript
const eoslime = require('eoslime').init();

const CONTRACT_NAME = 'mycontract';
const CONTRACT_EXECUTOR = new eoslime.Account('myaccount', 'publicKey', 'privateKey');
const ABI_PATH = path.join(__dirname, './contract/contract.abi');

let contract = eoslime.Contract(ABI_PATH, CONTRACT_NAME, CONTRACT_EXECUTOR);
```

**Note! If you don't provide `CONTRACT_EXECUTOR` the [`defaultAccount`](#eoslime-initialization) is applied.**

If you want to call a contract method from another account(executor) you can do:
```javascript
const eoslime = require('eoslime').init();

const CONTRACT_NAME = 'mycontract';
const ABI_PATH = path.join(__dirname, './contract/contract.abi');

const EXECUTOR_1 = new eoslime.Account('myacc1', 'publicKey1', 'privateKey1');
const EXECUTOR_2 = new eoslime.Account('myacc2', 'publicKey2', 'privateKey2');

let contract = eoslime.Contract(ABI_PATH, CONTRACT_NAME, EXECUTOR_1);

// EXECUTOR_1 will execute `doSmth` transaction on the blockchain
await contract.doSmth('Something'); 

// EXECUTOR_2 will execute `doSmth` transaction on the blockchain
await contract.doSmth('Something', { from: EXECUTOR_2 });

// EXECUTOR_1 will execute `doSmth` transaction on the blockchain
await contract.doSmth('Something');
```

eoslime is based on eosjs and when we are calling a contract method, eosjs optionals `{ broadcast: true, sign: true }` are always set to true

### Additional contract properties:     
---
**`contract.contractName`**  
For convience you have accsess to the contract name

**`contract.eosInstance`**   
For convience you have accsess to the eos instance(eosjs). 
This is useful when you want, for example, to read a table
```javascript
let tableResults = await contract.eosInstance.getTableRows({
                code: contract.contractName,
                scope: contract.contractName,
                table: tableName,
                limit: limit,
                lower_bound: l_bound,
                upper_bound: u_bound,
                json: true
            });
```

**`contract.defaultExecutor`**   
On contract initialization you provide a contract executor. This is the account, which will process the contract transactions a.k.a to execute contract methods on the blockchain.

## Utils
---
### Test

 `eoslime.utils.test.expectAssert`
 
```javascript
const eoslime = require('eoslime').init();


const WASM_PATH = path.join(__dirname, './contract/contract.wasm');
const ABI_PATH = path.join(__dirname, './contract/contract.abi');

describe('Test Contract', function () {
    it('Should throw', async () => {
        let wrongParameter = 'Wrong Parameter';
        let contract = await eoslime.CleanDeployer.deploy(WASM_PATH, ABI_PATH);
        
        await eoslime.utils.test.expectAssert(
            // doSmth is a contract method
            contract.doSmth(wrongParameter)
        );
    });
}
```

`eoslime.utils.test.expectMissingAuthority`
 

```javascript
const eoslime = require('eoslime').init();


const WASM_PATH = path.join(__dirname, './contract/contract.wasm');
const ABI_PATH = path.join(__dirname, './contract/contract.abi');

describe('Test Contract', function () {
    it('Should throw', async () => {
        let name = 'John';
        let maliciousAccount = (await eoslime.AccountsLoader.load())[0];
        
        let contract = await eoslime.CleanDeployer.deploy(WASM_PATH, ABI_PATH);
        
        await eoslime.utils.test.expectMissingAuthority(
            // doSmth is a contract method which could be called only from contract account
            contract.doSmth(name, { from: maliciousAccount })
        );
    });
}
```
## Example (eosio.token)
---

You can check eosio.token example to get better idea of how to work with **`eoslime`**.   
The example was made as tests so you can start them with:
```
npm test
```

## Roadmap
---

* ***cli***
* ***Built in mocha as testing framework***
* ***Make it more configurable***
