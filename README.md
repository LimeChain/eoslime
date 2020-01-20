[![npm version](https://badge.fury.io/js/eoslime.svg)](https://badge.fury.io/js/eoslime.svg) 
[![codecov](https://codecov.io/gh/LimeChain/eoslime/branch/master/graph/badge.svg)](https://codecov.io/gh/LimeChain/eoslime)

eoslime.js
============

EOS development and deployment framework based on eosjs.js. The framework's main purpose is to make the process of unit testing, deployment and compilation much simpler and much easier.

Telegram - https://t.me/eoslime   
Documentation - https://lyubo.gitbook.io/eoslime/

<<<<<<< HEAD
# Version 1.0.2 change log

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
* **Allow read-only contracts** - You are able now to instantiate a contract withouth a signer/executor and read the contract's tables
* **Add Tutorial section in the documentation**
* **Describe how examples in the documentation could be run**
* **Increase the code coverage from 46% to 90+ %**

=======
>>>>>>> 0b1d6e3dd38e1f4f9553dd0f5705a108b00daebc
# Version 1.0.1 change log

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