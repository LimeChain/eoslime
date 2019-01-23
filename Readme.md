eoslime.js
============

EOS development and deployment framework based on eosjs.js

### Installing 
---

```
npm install --save eoslime
```

Simple start
```javascript
const eoslime = require('eoslime').init();

const TOKEN_WASM_PATH = path.join(__dirname, './contract/eosio.token.wasm');
const TOKEN_ABI_PATH = path.join(__dirname, './contract/eosio.token.abi');

// Generate and setup freshly new accounts for usage
let accounnt = await eoslime.AccountsLoader.load(2);
let tokenContractAccount = accounts[0];
let tokensIssuer = accounts[1];

// Deploy contract (localhost)
let tokenContract = await eoslime.AccountDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH, tokenContractAccount);

// Call contract functions
await tokenContract.create(tokensIssuer.name, '100 SYS');
```

#### Eoslime initialization
---
***Parameters purpose***
* network - endpoint for connecting
* chainId - network chain id
* defaultAccount - It serves in two ways 
    * As a creator of another accounts ([Accounts Loader](#accounts-loader))
    * In `AccountDeployer.deploy(wasm, abi, contractAccount)` as default parameter for `contractAccount`

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
Initialization for another network:
```javascript
let jungleNet = 'https://jungle2.cryptolions.io';
let jungleChainId = 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473';

const eoslime = require('eoslime').init(jungleNet, jungleChainId);
```

#### Account
---
Account is some kind of container for all information an EOS account has. 
```javascript
const eoslime = require('eoslime').init();

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

#### Accounts Loader
---
Accounts Loader generates for you freshly new accounts which are set up and ready for use. 
```javascript
const eoslime = require('eoslime').init();

let accounts = await eoslime.AccountsLoader.load(2);
```

***Important!***
The creator of these accounts is the [`defaultAccount`](#default-account) you have passed on initialization. 
Accounts are preset with the following:
* RAM - `8192 bytes` 
* Stake of network quantity - `10.0000 SYS`
* Stake of cpu quantity - `10.0000 SYS`

**Both the RAM buyer and the bandwidth delegate are the same [`defaultAccount`](#default-account)**

You could use the Accounts Loader to prepare only one account as:

```javascript
const eoslime = require('eoslime').init();

let oneAccount = (await eoslime.AccountsLoader.load())[0];
```

#### Deployers
---
##### Account Deployer
Account Deployer is used when you already have  an account on which you want to deploy a contract or when you have an account with deployed contract and want to upgrade the contract code.

```javascript
const eoslime = require('eoslime').init();

const WASM_PATH = path.join(__dirname, './contract/contract.wasm');
const ABI_PATH = path.join(__dirname, './contract/contract.abi');

let contractAccount = (await eoslime.AccountsLoader.load())[0];

let contract = await eoslime.AccountDeployer.deploy(WASM_PATH, ABI_PATH, contractAccount);
```
If you don't provide `contractAccount` the [`defaultAccount`](#default-account) will be the account on which the contract code will be deployed.

The `deploy` function returns to you a ready to use [instance](#contract) of the deployed contract.

##### Clean Deployer
Clean Deployer is used when you don't have a contract account. It creates for you a new contract account on which the contract code is deployed after that. The creator of the new contract account is the [`defaultAccount`](#default-account). In this way the Clean Deployer always deploy a contract code on a new account and for testing purposes it is convient because for example you have two tests and one contract account. The first test writes to the contract storage, but you need this storage to be clear for the second test due to some assertion or something like that.

```javascript
const eoslime = require('eoslime').init();

const WASM_PATH = path.join(__dirname, './contract/contract.wasm');
const ABI_PATH = path.join(__dirname, './contract/contract.abi');

let contract = await eoslime.CleanDeployer.deploy(WASM_PATH, ABI_PATH);
```

The `deploy` function returns to you a ready to use [instance](#contract) of the deployed contract.

#### Contract
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

**If you don't provide [`CONTRACT_EXECUTOR`](#contract.defaultExecutor) the [`defaultAccount`](#default-account) is applied.**

***Note! Contract methods are the same as in the C++ contract code.***

`contract.contractName`
For convience you have accsess to the contract name

`contract.eosInstance`
For convience you have accsess to the eos instance(eosjs). 
This is useful when you want, for example, to read from a table
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

`contract.defaultExecutor`
On contract initialization you provide a contract executor. This is the account, which will process the contract transactions a.k.a to execute contract methods on the blockchain.

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

#### Utils
---
##### Test

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
#### Example (eosio.token)
---

You can check eosio.token example to get better idea of how to work with `eoslime`.
The example was made as tests so you can start them with:
```
npm test
```

#### Roadmap
---

* ***cli***
* ***Built in mocha as testing framework***
