[![npm version](https://badge.fury.io/js/eoslime.svg)](https://badge.fury.io/js/eoslime.svg) 
[![codecov](https://codecov.io/gh/LimeChain/eoslime/branch/master/graph/badge.svg)](https://codecov.io/gh/LimeChain/eoslime)

eoslime.js
============

EOS development and deployment framework based on eosjs.js. The framework's main purpose is to make the process of unit testing, deployment and compilation much simpler and much easier.

Telegram - https://t.me/eoslime   
Documentation - https://lyubo.gitbook.io/eoslime/

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