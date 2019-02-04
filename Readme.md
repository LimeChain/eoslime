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
const eoslimeTool = require('eoslime');
// Local account
const defaultAccount = new eoslimeTool.Account('name', 'privateKey');

const eoslime = eoslimeTool.init(defaultAccount);

const TOKEN_WASM_PATH = './contract/eosio.token.wasm';
const TOKEN_ABI_PATH = './contract/eosio.token.abi';

// Generate and setup freshly new accounts for usage
let accounts = await eoslime.Account.createRandoms(2);
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

***Simple tests***
```javascript
const assert = require('assert');
const eoslime = require('eoslime').init();

const TOKEN_WASM_PATH = './contract/eosio.token.wasm';
const TOKEN_ABI_PATH = './contract/eosio.token.abi';

describe('EOSIO Token', function () {
    let tokenContract;
    let tokensIssuer;
    let tokensHolder;

    const TOTAL_SUPPLY = '1000000000.0000 SYS';
    const HOLDER_SUPPLY = '100.0000 SYS';

    before(async () => {
        let accounts = await eoslime.utils.test.createTestingAccounts();
        tokensIssuer = accounts[0];
        tokensHolder = accounts[1];
    });

    beforeEach(async () => {
        tokenContract = await eoslime.CleanDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);
    });

    it('Should create a new token', async () => {
        await tokenContract.create(tokensIssuer.name, TOTAL_SUPPLY);

        let tokenInitialization = await tokenContract.eosInstance.getCurrencyStats(tokenContract.contractName, 'SYS');

        assert.equal(tokenInitialization.SYS.max_supply, TOTAL_SUPPLY, 'Incorrect tokens supply');
        assert.equal(tokenInitialization.SYS.issuer, tokensIssuer.name, 'Incorrect tokens issuer');

    });

    it('Should issue tokens', async () => {
        await tokenContract.create(tokensIssuer.name, TOTAL_SUPPLY);
        await tokenContract.issue(tokensHolder.name, HOLDER_SUPPLY, 'memo', { from: tokensIssuer });

        let holderBalance = await tokenContract.eosInstance.getCurrencyBalance(tokenContract.contractName, tokensHolder.name, 'SYS');
        assert.equal(holderBalance[0], HOLDER_SUPPLY, 'Incorrect holder balance');
    });

    it('Should throw if tokens quantity is negative', async () => {
        await tokenContract.create(tokensIssuer.name, TOTAL_SUPPLY);
        const INVALID_ISSUING_AMOUNT = '-100.0000 SYS';
        
        await eoslime.utils.test.expectAssert(
            tokenContract.issue(tokensHolder.name, INVALID_ISSUING_AMOUNT, 'memo', { from: tokensIssuer })
        );

        let holderBalance = await tokenContract.eosInstance.getCurrencyBalance(tokenContract.contractName, tokensHolder.name, 'SYS');
        assert.equal(holderBalance.length, 0, 'Incorrect holder balance');
    });
});
```

## Eoslime initialization
---
***Parameters purpose***
* account - an instance of **eoslime.Account**
    It serves in three ways : 
    * As a creator of another accounts/bandwidth and ram payer ([Account](#account))
    * In **[`eoslime.AccountDeployer.deploy(wasmPath, abiPath, contractAccount)`](#account-deployer)** as default parameter for **`contractAccount`**
    * In **[`eoslime.Contract(abiPath, contractName, contractExecutor)`](#contract)** as default parameter for **`contractExecutor`**

---

Initialization with default parameters:
```javascript
const eoslime = require('eoslime').init();
```

***Defaults***:
* account 
```javascript
Account {
    name: 'eosio',
    permissions: {
        active: { actor: 'eosio', permission: 'active' }
        owner: { actor: 'eosio', permission: 'owner' }
    }
    publicKey: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
    privateKey: '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3',
    network: {
        "name": "local",
        "url": "http://127.0.0.1:8888",
        "chainId": "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
    }
}
```
Initialization on supported network:
```javascript
const eoslimeTool = require('eoslime');
// Existing account on jungle network
const jungleAccount = new eoslimeTool.Account('name', 'privateKey', 'jungle');

const eoslime = eoslimeTool.init(jungleAccount);
```

Initialization on unsupported network:
```javascript
const eoslimeTool = require('eoslime');
// Existing account on custom network
const customNetworkAccount = new eoslimeTool.Account('name', 'privateKey', { url: 'Your network', chainId: 'Your chainId' });

const eoslime = eoslimeTool.init(customNetworkAccount);
```
## Account
---
Account is some kind of util for working with EOS accounts

***Initialization:***
```javascript
    const eoslime = require('eoslime');
    let account = new eoslime.Account('name', 'privateKey', 'network');
```

***Parameters:***
* name - account name
* privateKey - private key of the account
* network - network name. Supported names are: **[ local ] [ jungle ] [ bos ] [ worbli ] [ main ]**. 

***For custom or another unsupported network, you could provide:***
```javascript
{ url: "Your network url", chainId: "Your network chainId" }
```

***Defaults:***
* network - `local`
___

**Initialized account properties:**
* `name` - Account name
* `permissions` - Account permissions
```javascript
        permissions: {
            active: { actor: '', permission: '' }
            owner: { actor: '', permission: '' }
        }
```
* `publicKey` - Public key
* `privateKey` - Private key
* `network` - Network account lives in
```javascript
        network: { -
            name: '',
            url: '',
            chainId: ''
        }
```
---
`loadRam` **[function]** - buy ram for this account
```javascript
    const eoslime = require('eoslime');
    // Existing accounts on local network
    let account1 = new eoslime.Account('myAcc1', 'myPrivateKey1');
    let account2 = new eoslime.Account('myAcc1', 'myPrivateKey1');
    
    // Account1 will load ram for account2
    await account2.loadRam({ payer: account1, bytes: 1000 });
```
**Defaults:**
* `payer` - current account
* `bytes` - 10000
```javascript
    const eoslime = require('eoslime');
    
    // Existing account on local network
    let account = new eoslime.Account('myAcc', 'myPrivateKey');
    
    // The account will load own ram for 10000 bytes
    await account.loadRam();
```
---
`loadBandwidth` **[function]** - buy cpu and network for this account
```javascript
    const eoslime = require('eoslime');
    // Existing accounts on local network
    let account1 = new eoslime.Account('myAcc1', 'myPrivateKey1');
    let account2 = new eoslime.Account('myAcc1', 'myPrivateKey1');
    
    // Account1 will load cpu and network for account2 for 100 SYS 
    await account2.loadBandwidth({ payer: account1, cpu: '100', net: '100' });
```
**Defaults:**
* `payer` - current account
* `cpu` - 10 SYS
* `net` - 10 SYS
```javascript
    const eoslime = require('eoslime');
    
    // Existing account on local network
    let account = new eoslime.Account('myAcc', 'myPrivateKey');
    
    // The account will load own cpu and net for 10 SYS
    await account.loadBandwidth();
```
---

**Static account properties:**

`createFromName` - Creates freshly new account from name

**Important!** Keep in mind that this name may already exists on the network
```javascript
    const eoslime = require('eoslime');

    // Existing account on local network
    let accountCreator = new eoslime.Account('myAcc', 'myPrivateKey');
    
    // accountCreator will create account2 on his network, a.k.a accountCreator.network
    let account2 = await eoslime.Account.createFromName('name', accountCreator);
```
**Defaults:**
* `accountCreator` - eosio account
```javascript
    const eoslime = require('eoslime');
    
    // Eosio account will create this account on local network
    let account = await eoslime.Account.createFromName('name');
```

`createRandom` - Creates freshly new random account
```javascript
    const eoslime = require('eoslime');

    // Existing account on local network
    let accountCreator = new eoslime.Account('myAcc', 'myPrivateKey');
    
    // accountCreator will create account2 on his network, a.k.a accountCreator.network
    let account2 = await eoslime.Account.createRandom(accountCreator);
```
**Defaults:**
* `accountCreator` - eosio account
```javascript
    const eoslime = require('eoslime');
    
    // Eosio account will create this account on local network
    let account = await eoslime.Account.createRandom();
```

`createRandoms` - Creates freshly new random accounts
```javascript
    const eoslime = require('eoslime');

    // Existing account on local network
    let accountsCreator = new eoslime.Account('myAcc', 'myPrivateKey');
    
    // accountsCreator will create random accounts on his network, a.k.a accountsCreator.network
    const accountsCount = 2;
    let accounts = await eoslime.Account.createRandoms(accountsCount, accountsCreator);
```
**Defaults:**
* `accountCreator` - eosio account
```javascript
    const eoslime = require('eoslime');
    
    // Eosio account will create this accounts on local network
    const accountsCount = 2;
    let accounts = await eoslime.Account.createRandoms(accountsCount);
```

`createEncrypted` - Creates freshly new encrypted account
```javascript
    const eoslime = require('eoslime');

    // Existing account on local network
    let accountCreator = new eoslime.Account('myAcc', 'myPrivateKey');
    
    // accountCreator will create encrypted JSON account on his network, a.k.a accountCreator.network
    const password = 'secret password';
    let encryptedJSONAccount = await eoslime.Account.createEncrypted(password, accountCreator);
    
    /*
     Encrypted JSON account => {
            "accountName": "random generated",
            "network": {
                    "name": accountCreator.network.name,
                    "url": accountCreator.network.url,
                    "chainId": accountCreator.network.chainId
                },
            "ciphertext": "encrypted private key"
        }
    */
```
**Defaults:**
* `accountCreator` - eosio account
```javascript
    const eoslime = require('eoslime');

    // Eosio account will create this account on local network
    const password = 'secret password';
    let encryptedJSONAccount = await eoslime.Account.createEncrypted(password);
    
    /*
     Encrypted JSON account => {
            "accountName": "random generated",
            "network": {
                "name": "local",
                "url": "http://127.0.0.1:8888",
                "chainId": "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
            }
            "ciphertext": "encrypted private key"
        }
    */
```

`fromEncryptedJson` - Convert encrypted account in account
```javascript
    const eoslime = require('eoslime');

    // Existing account on local network
    let accountCreator = new eoslime.Account('myAcc', 'myPrivateKey');
    
    // accountCreator will create encrypted JSON account on his network, a.k.a accountCreator.network
    const password = 'secret password';
    let encryptedJSONAccount = await eoslime.Account.createEncrypted(password, accountCreator);
    
    let decryptedAccount = eoslime.Account.fromEncryptedJson(password, encryptedJSONAccount);
```

***Important! If eoslime function accepts account parameter, it should be an instance of `eoslime.Account`***

## Deployers
---
### Account Deployer
Account Deployer is used when you already have an account on which you want to deploy a new contract or when you have an account with already deployed contract and you want to upgrade it.

***Deploy contract on provided account:***
```javascript
// Local network initialization with defaultAccount = eosio
const eoslime = require('eoslime').init();

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

let contractAccount = await eoslime.Account.createRandom();

let contract = await eoslime.AccountDeployer.deploy(WASM_PATH, ABI_PATH, contractAccount);
```

***Deploy contract on default account:***
```javascript
const eoslimeTool = require('eoslime');
// Pre-created local network account
const defaultContractAccount = new eoslimeTool.Account('name', 'privateKey');
// Local network initialization
const eoslime = eoslimeTool.init(defaultContractAccount);

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

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
// Local network initialization
const eoslime = require('eoslime').init();

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

let contract = await eoslime.CleanDeployer.deploy(WASM_PATH, ABI_PATH);
```

The `deploy` function returns to you a ready to use [instance](#contract) of the deployed contract.

## Contract
---
You can get a contract instance in two ways
* Each Deployer returns to you a new contract after deployment
* You can instatiate an already existing contract as:
```javascript
// Local network initialization
const eoslime = require('eoslime').init();

const CONTRACT_NAME = 'mycontract';
// Pre-created local network account
const CONTRACT_EXECUTOR = new eoslime.Account('myaccount', 'privateKey');
const ABI_PATH = './contract/contract.abi';

let contract = eoslime.Contract(ABI_PATH, CONTRACT_NAME, CONTRACT_EXECUTOR);
```

**Note! If you don't provide `CONTRACT_EXECUTOR` the [`defaultAccount`](#eoslime-initialization) is applied.**

If you want to call a contract method from another account(executor) you can do:
```javascript
// Local network initialization
const eoslime = require('eoslime').init();

const CONTRACT_NAME = 'mycontract';
const ABI_PATH = './contract/contract.abi';

// Pre-created local network accounts
const EXECUTOR_1 = new eoslime.Account('myacc1', 'privateKey1');
const EXECUTOR_2 = new eoslime.Account('myacc2', 'privateKey2');

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

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

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

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

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

`eoslime.utils.test.createTestingAccounts`
```javascript
const assert = require('assert');
const eoslime = require('eoslime').init();

const WASM_PATH = './contract/contract.wasm';
const ABI_PATH = './contract/contract.abi';

describe('Test Contract', function () {
    it('Should create 10 test accounts', async () => {
        let testAccounts = await eoslime.utils.test.createTestingAccounts();
        
        for (const account of testAccounts) {
            assert(account instanceof eoslime.Account, 'Broken account');
        }
        
        assert(testAccounts.length == 10, 'Unexpected accounts count');
    });
}
```
## Example (eosio.token)
---

You can check eosio.token example to get better idea of how to work with **`eoslime`**.   
The example was made as tests so you should:
* Run nodoes locally
* Start example with:
```
npm test
```

## Roadmap
---

* ***cli***
* ***Write eoslime tests***
* ***Built in mocha as testing framework***
* ***Make it more configurable***

