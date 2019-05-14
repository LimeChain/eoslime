[![npm version](https://badge.fury.io/js/eoslime.svg)](https://badge.fury.io/js/eoslime.svg) 
[![codecov](https://codecov.io/gh/LimeChain/eoslime/branch/master/graph/badge.svg)](https://codecov.io/gh/LimeChain/eoslime)

eoslime.js
============

EOS development and deployment framework based on eosjs.js. The framework's main purpose is to make the process of unit testing, deployment and compilation much simpler and much easier.

## Installing 
---

```
npm install eoslime
```

***Simple usage***

```javascript
/* 
    Supported Networks: [ local ] [ jungle ] [ bos ] [ worbli ] [ main ] or  { url: 'custom url', chainId: 'custom id' }
*/
const eoslime = require('eoslime').init('local');

const TOKEN_WASM_PATH = './contract/eosio.token.wasm';
const TOKEN_ABI_PATH = './contract/eosio.token.abi';

// Generate and setup freshly new accounts for usage
let accounts = await eoslime.Account.createRandoms(2);
let tokensIssuer = accounts[0];
let tokensHolder = accounts[1];

// Deploy contract (localhost)
let tokenContract = await eoslime.CleanDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);

// Call contract functions
// By default provider's default account(localhost - eosio) executes methods calls on the blockchain
await tokenContract.create(tokensIssuer.name, '100 SYS');

// Change the execution account 
await tokenContract.issue(tokensHolder.name, '10 SYS', 'memo', { from: tokensIssuer });
```

***Simple tests***
```javascript
const assert = require('assert');
const eoslime = require('./../../').init();

const TOKEN_WASM_PATH = './example/eosio-token/contract/eosio.token.wasm';
const TOKEN_ABI_PATH = './example/eosio-token/contract/eosio.token.abi';

describe('EOSIO Token', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    let tokenContract;
    let tokensIssuer;
    let tokensHolder;

    const TOTAL_SUPPLY = '1000000000.0000 SYS';
    const HOLDER_SUPPLY = '100.0000 SYS';

    before(async () => {
        /* 
            Accounts loader generates random accounts for easier testing
            But you could use it also to create new accounts on each network
            For more details, visit the documentation
        */
        let accounts = await eoslime.Account.createRandoms(2);
        tokensIssuer = accounts[0];
        tokensHolder = accounts[1];
    });

    beforeEach(async () => {
        /*
            CleanDeployer creates for you a new account behind the scene
            on which the contract code is deployed

            Note! CleanDeployer always deploy the contract code on a new fresh account

            You can access the contract account as -> tokenContract.executor
        */
        tokenContract = await eoslime.CleanDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);
    });

    it('Should create a new token', async () => {
        await tokenContract.create(tokensIssuer.name, TOTAL_SUPPLY);

        /*
            You have access to the EOS(eosjs) instance as -> contract.provider.eos
            This gives us flexibility and convenience

                For example when you want to read a table -> 

                await contract.provider.eos.getTableRows({
                    code: code,
                    scope: scope,
                    table: table,
                    limit: limit,
                    lower_bound: l_bound,
                    upper_bound: u_bound,
                    json: true
                });
        */
        let tokenInitialization = await tokenContract.provider.eos.getCurrencyStats(tokenContract.name, 'SYS');

        assert.equal(tokenInitialization.SYS.max_supply, TOTAL_SUPPLY, 'Incorrect tokens supply');
        assert.equal(tokenInitialization.SYS.issuer, tokensIssuer.name, 'Incorrect tokens issuer');

    });

    it('Should issue tokens', async () => {
        await tokenContract.create(tokensIssuer.name, TOTAL_SUPPLY);
        /*
            On each contract method you can provide an optional object -> { from: account }
            If you don't provide a 'from' object, the method will be executed from the contract account authority
        */
        await tokenContract.issue(tokensHolder.name, HOLDER_SUPPLY, 'memo', { from: tokensIssuer });

        let holderBalance = await tokenContract.provider.eos.getCurrencyBalance(tokenContract.name, tokensHolder.name, 'SYS');
        assert.equal(holderBalance[0], HOLDER_SUPPLY, 'Incorrect holder balance');
    });

    it('Should throw if tokens quantity is negative', async () => {
        await tokenContract.create(tokensIssuer.name, TOTAL_SUPPLY);
        const INVALID_ISSUING_AMOUNT = '-100.0000 SYS';

        /*
            For easier testing, eoslime provides you ('utils.test') with helper functions
        */
        await eoslime.utils.test.expectAssert(
            tokenContract.issue(tokensHolder.name, INVALID_ISSUING_AMOUNT, 'memo', { from: tokensIssuer })
        );

        let holderBalance = await tokenContract.provider.eos.getCurrencyBalance(tokenContract.name, tokensHolder.name, 'SYS');
        assert.equal(holderBalance.length, 0, 'Incorrect holder balance');
    });
});
```

## Eoslime initialization
---
***Parameters:***
* network name - **[ local ] [ jungle ] [ bos ] [ worbli ] [ main ] or  { url: 'custom url', chainId: 'custom id' }**
---

##### Initialization with default parameters:
```javascript
const eoslime = require('eoslime').init();
```

***Defaults***:
* network name - **local**   
On local network, eoslime.provider.defaultAccount is set automatically to **eosio**

```javascript
const eoslime = require('eoslime').init();

eoslime.provider.defaultAccount => 

    Account {
        name: 'eosio',
        permissions: {
            active: { actor: 'eosio', permission: 'active' }
            owner: { actor: 'eosio', permission: 'owner' }
        }
        publicKey: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
        privateKey: '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3',
        provider: {
             network: {
                "name": "local",
                "url": "http://127.0.0.1:8888",
                "chainId": "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
            },
            ...
        }
    }
```

**Important ! Only local network comes with preset `provider's default account`. If you connect to another network you should set provider's default account manually**
##### Initialization on supported network
```javascript
const eoslime = require('eoslime').init('jungle');
```

##### Initialization on unsupported network
```javascript
const eoslime = require('eoslime').init({ url: 'Your network', chainId: 'Your chainId' });
```
## Account
---
Account is a class that provides an easy access to blockchain account endpoint.

#### 1. Instantiate
```javascript
    const eoslime = require('eoslime').init();
    
    // Load existing network account
    let account = eoslime.Account.load('name', 'privateKey');
```

***Parameters:***
* name - account name
* privateKey - private key of the account

#### 2. Instantiated account
##### 2.1 Properties
* name
* publicKey
* privateKey
* provider - The network provider that the account is connected to
* permissions:
```javascript
        {
            active: { actor: '', permission: '' }
            owner: { actor: '', permission: '' }
        }
```
---
##### 2.2 Functions
* **buyRam (bytes, payer)** - buy ram for this account
```javascript
    const eoslime = require('eoslime').init();
    // Existing accounts on local network
    let payer = eoslime.Account.load('myAcc1', 'myPrivateKey1');
    let account2 = eoslime.Account.load('myAcc2', 'myPrivateKey2');
    
    // Payer will buy ram for account2
    await account2.buyRam(1000,  payer);
```
*Defaults:*
    
* `payer` - current account

```javascript
    const eoslime = require('eoslime').init();
    
    // Existing account on local network
    let account = eoslime.Account.load('myAcc', 'myPrivateKey');
    
    // The account will buy ram by self for 10000 bytes
    await account.buyRam(10000);
```    


* **buyBandwidth (cpu, net, payer)** - buy cpu and network for this account
```javascript
    const eoslime = require('eoslime').init();
    // Existing accounts on local network
    let payer = eoslime.Account.load('myAcc1', 'myPrivateKey1');
    let account2 = eoslime.Account.load('myAcc2', 'myPrivateKey2');
    
    // Payer will buy cpu and network for account2 for 100 SYS 
    await account2.buyBandwidth(100, 100, payer);
```
*Defaults:*
* `payer` - current account
```javascript
    const eoslime = require('eoslime').init();
    
    // Existing account on local network
    let account = eoslime.Account.load('myAcc', 'myPrivateKey');
    
    // The account will buy cpu and net by self for 10 SYS
    await account.buyBandwidth(10, 10);
```

* **send (toAccount, amount)** - send EOS tokens(SYS) to another account
```javascript
    const eoslime = require('eoslime').init();
    // Existing accounts on local network
    let sender = eoslime.Account.load('myAcc1', 'myPrivateKey1');
    let receiver = eoslime.Account.load('myAcc2', 'myPrivateKey2');
    
    // The sender will send 100 SYS tokens to receiver
    await sender.send(receiver, 100);
```

* **getBalance (code, symbol)** - get the account balance for token with symbol
```javascript
    const eoslime = require('eoslime').init();
    // Existing accounts on local network
    let account = eoslime.Account.load('myAcc1', 'myPrivateKey1');
    
    // custom.token is a contract account with a token deployed on it
    await account.getBalance(custom.token, 'Custom');
```

*Defaults:*
* `code` - eosio.token
* `symbol` - SYS
```javascript
    const eoslime = require('eoslime').init();
    // Existing accounts on local network
    let account = eoslime.Account.load('myAcc1', 'myPrivateKey1');
    
    await account.getBalance();
```


#### 3. Static account properties
* **createFromName (name, accountCreator)** - Creates a fresh new account for a given name

**Important!** Keep in mind that this name may already exists on the network

```javascript
    const eoslime = require('eoslime').init();

    // Existing account on local network
    let accountCreator = eoslime.Account.load('myAcc', 'myPrivateKey');
    
    // accountCreator will create account2 on the network, a.k.a accountCreator.provider.network
    let account2 = await eoslime.Account.createFromName('name', accountCreator);
```
*Defaults:*
* `accountCreator` - provider's default account
```javascript
    const eoslime = require('eoslime').init();
    
    // Provider’s default account will create this account on local network
    let account = await eoslime.Account.createFromName('name');
```

* **createRandom (accountCreator)** - Creates new random account

```javascript
    const eoslime = require('eoslime').init();

    // Existing account on local network
    let accountCreator = eoslime.Account.load('myAcc', 'myPrivateKey');
    
    // accountCreator will create account2 on the network, a.k.a accountCreator.provider.network
    let account2 = await eoslime.Account.createRandom(accountCreator);
```
*Defaults:*
* `accountCreator` - provider's default account
```javascript
    const eoslime = require('eoslime').init();
    
    // Provider's default account account will create this account on local network
    let account = await eoslime.Account.createRandom();
```

* **createRandoms (accountsCount, accountCreator)** - Creates new random accounts

```javascript
    const eoslime = require('eoslime').init();

    // Existing account on local network
    let accountsCreator = eoslime.Account.load('myAcc', 'myPrivateKey');
    
    // accountsCreator will create random accounts on the network, a.k.a accountsCreator.provider.network
    const accountsCount = 2;
    let accounts = await eoslime.Account.createRandoms(accountsCount, accountsCreator);
```
*Defaults:*
* `accountCreator` - provider's default account
```javascript
    const eoslime = require('eoslime').init;
    
    // Provider's default account will create this accounts on local network
    const accountsCount = 2;
    let accounts = await eoslime.Account.createRandoms(accountsCount);
```

* **createEncrypted (password, accountCreator)** - Creates fresh new account and returns the encrypted json format of it  
How it works: Creates a fresh new random account. Created account's data is hashed and a **cipherText** is derived by encrypting **privateKey::dataHash**

```javascript
// Account data for hashing
{ 
    name: account.name, 
    network: account.provider.network, 
    privateKey: account.privateKey 
}
```
```javascript
    const eoslime = require('eoslime').init();

    // Existing account on local network
    let accountCreator = new eoslime.Account('myAcc', 'myPrivateKey');
    
    // accountCreator will create encrypted JSON account on the network, a.k.a accountCreator.provider.network  
    const password = 'secret password';
    let encryptedJSONAccount = await eoslime.Account.createEncrypted(password, accountCreator);
    
    /*
     Encrypted JSON account => {
            "name": "random generated",
            "network": {
                    "name": 'name',
                    "url": 'url',
                    "chainId": 'chainId'
                },
            "ciphertext": "encrypted private key + dataHash"
        }
    */
```
*Defaults:*
* `accountCreator` - provider's default account
```javascript
    const eoslime = require('eoslime').init;

    // Provider's default account will create this account on local network
    const password = 'secret password';
    let encryptedJSONAccount = await eoslime.Account.createEncrypted(password);
```

* **fromEncrypted (encryptedAccount, password)** - Decrypt an encrypted account   
How it works: Decrypts **cipherText** and gets it's parts (privateKey and dataHash). The PrivateKey is merged with the other **encryptedAccount** properties into an object which after the merging is hashed. This hash is validated against the **dataHash** for correctness.

```javascript
    const eoslime = require('eoslime').init();

    // Existing account on local network
    let accountCreator = new eoslime.Account('myAcc', 'myPrivateKey');
    
    // accountCreator will create encrypted JSON account on the network, a.k.a accountCreator.provider.network
    const password = 'secret password';
    let encryptedJSONAccount = await eoslime.Account.createEncrypted(password, accountCreator);
    
    let decryptedAccount = eoslime.Account.fromEncrypted(encryptedJSONAccount, password);
```

***Important! Keep in mind that each account creation method is executing an account creation blockchain transaction***


#### 4. Default account
Default account or main account is the account which executes blockchain transactions if none is provided. Most of the functions have executor in the form of **payer** | **accountCreator** | **contractExecutor**. 
For example:
When you are on local network **eosio** account is preset automatically for you as default/main account. You are able to do 
```javascript
await Account.createFromName('some name')
```
without the need of specifying the **accountCreator** every time.

If you are on another network, you can set the default/main account as follow:

```javascript
const eoslime = require('jungle').init();

const jungleMainAccount = eoslime.Account.load('name', 'privateKey');
eoslime.Provider.defaultAccount = jungleMainAccount;
```

In this way **jungleMainAccount** will execute every blockchain transaction whenever the execution account is needed but none was provided.

## Providers
---
Providers are the blockchain connectors. A provider is instantiated internally based on the network name provided on initialization: **[ local ] [ jungle ] [ bos ] [ worbli ] [ main ] or  { url: 'custom url', chainId: 'custom id' }**   
   
Depending on what network you want to connect to, the following providers are available:
**[ LocalProvider ] [ JungleProvider ] [ BosProvider ] [ WorbliProvider ] [ MainProvider ] [ CustomProvider ]** : 
``` javascript
const eoslime = require('eoslime').init('jungle') -> JungleProvider
```
    
#### 1. Properties:
* network
``` javascript
{
    name: '',
    url: '',
    chainId: ''
}
```
* defaultAccount - The default/main account from which the blockchain transactions are executed
* eos - **eosjs** instance that serves as a bridge with the blockchain

## Deployers
---
### Account Deployer
Account Deployer is used when you already have an account on which you want to deploy a new contract or when you have an account with already deployed contract and you want to upgrade it.

```javascript
const eoslime = require('eoslime').init();

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

let contractAccount = eoslime.Account.load('name', 'privateKey');

let contract = await eoslime.AccountDeployer.deploy(WASM_PATH, ABI_PATH, contractAccount);
```

The `deploy` function returns a ready to use [instance](#contract) of the deployed contract.

### Clean Deployer
Clean Deployer is used when you don't have a contract account. It creates a new contract account on which the contract is is being deployed. The creator of the new contract account is the provider's default account. The Clean Deployer is always deploying contracts on new accounts. 

This is helpful when we want to do the following:   
We have two tests and one contract account. The first test writes to the contract storage, but you need this storage to be clear for the second test due to some assertions or something like that depending on the use-case.
```javascript
// Local network initialization
const eoslime = require('eoslime').init();

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

let contract = await eoslime.CleanDeployer.deploy(WASM_PATH, ABI_PATH);
```

The `deploy` function returns a ready to use [instance](#contract) of the deployed contract.

## Contract
---
You can get a contract's instance in two ways
* Each Deployer returns to you a new contract after deployment
* You can instatiate an already existing contract by doing:
```javascript
// Local network initialization
const eoslime = require('eoslime').init();

const CONTRACT_NAME = 'mycontract';
// Pre-created local network account
const CONTRACT_EXECUTOR = new eoslime.Account('myaccount', 'privateKey');
const ABI_PATH = './contract/contract.abi';

let contract = eoslime.Contract(ABI_PATH, CONTRACT_NAME, CONTRACT_EXECUTOR);
```

**Note! If you don't provide `CONTRACT_EXECUTOR` the provider's default account will be applied as executor**

If you want to call a contract method from another account(executor) you can do:
```javascript
// Local network initialization
const eoslime = require('eoslime').init();

const CONTRACT_NAME = 'mycontract';
const ABI_PATH = './contract/contract.abi';

// Pre-created local network accounts
const EXECUTOR_1 = eoslime.Account.load('myacc1', 'privateKey1');
const EXECUTOR_2 = eoslime.Account.load('myacc2', 'privateKey2');

let contract = eoslime.Contract(ABI_PATH, CONTRACT_NAME, EXECUTOR_1);

// EXECUTOR_1 will execute `doSmth` transaction on the blockchain
await contract.doSmth('Something'); 

// EXECUTOR_2 will execute `doSmth` transaction on the blockchain
await contract.doSmth('Something', { from: EXECUTOR_2 });

// EXECUTOR_1 will execute `doSmth` transaction on the blockchain
await contract.doSmth('Something');
```

**Important! eoslime is based on eosjs and when we are calling a contract method, eosjs options `{ broadcast: true, sign: true }` are always set to true**

#### 1. Properties
* name - For convenience you have accsess to the contract name
* provider - For convenience you have accsess to the network provider
This is helpful when you want, for example, to read a table
```javascript
let tableResults = await contract.provider.eos.getTableRows({
                code: contract.name,
                scope: contract.name,
                table: tableName,
                limit: limit,
                lower_bound: l_bound,
                upper_bound: u_bound,
                json: true
            });
```
* executor - The account which will execute contract methods (**transactions**) on the blockchain
* contract methods

## Utils
---
### Test

* ##### `eoslime.utils.test.expectAssert`
```javascript
const eoslime = require('eoslime').init();

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

describe('Test Contract', function () {
    it('Should throw', async () => {
        let wrongParameter = 'Wrong Parameter';
        let contract = await eoslime.CleanDeployer.deploy(WASM_PATH, ABI_PATH);
        
        await eoslime.utils.test.expectAssert(
            contract.doSmth(wrongParameter)
        );
    });
}
```

* ##### `eoslime.utils.test.expectMissingAuthority`
 ```javascript
const eoslime = require('eoslime').init();

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

describe('Test Contract', function () {
    it('Should throw', async () => {
        let maliciousAccount = await eoslime.Account.createRandom();
        
        let contract = await eoslime.CleanDeployer.deploy(WASM_PATH, ABI_PATH);
        
        await eoslime.utils.test.expectMissingAuthority(
            // doSmth could be called only from contract account
            contract.doSmth({ from: maliciousAccount })
        );
    });
}
```

## Example (eosio.token)
---

You can check eosio.token example to get better idea of how to work with **`eoslime`**.   
The example is for testing purposes only.
You must:
* Run nodoes locally
* Start example with:
```
npm run start
```

## Roadmap
---

* ***cli***
* ***Write eoslime tests***
* ***Built in mocha as testing framework***
* ***Make it more configurable***
