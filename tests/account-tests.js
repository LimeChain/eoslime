const assert = require('assert');
const eoslimeTool = require('./../');
const eoslime = eoslimeTool.init();

const Account = eoslime.Account;
const Networks = require('./../src/helpers/networks.json');
const EOSInstance = require('./../src/helpers/eos-instance');

const createUniqueAccountName = require('./../src/account/public-key-name-generator').createAccountNameFromPublicKey;

/*
    You should have running local nodeos in order to run tests
*/

describe('Account', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    // this.timeout(15000);

    /*
        Deploy eos token contract on local nodoes so we can get tokens for buying ram and bandwidth
    */

    const SYSTEM_TOKEN_NAME = 'acc.systoken';
    const ACCOUNT_NAME = 'eosio';
    const ACCOUNT_PRIVATE_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
    const ACCOUNT_PUBLIC_KEY = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';

    before(async () => {
        const TOKEN_ABI_PATH = './example/eosio-token/contract/eosio.token.abi';
        const TOKEN_WASM_PATH = './example/eosio-token/contract/eosio.token.wasm';
        const TOTAL_SUPPLY = '1000000000.0000 SYS';

        // Creates eosio account if you don't have it
        try {
            await Account.createFromName(ACCOUNT_NAME);
        } catch (error) { }

        try {
            var tokenAccount = await Account.createFromName(SYSTEM_TOKEN_NAME);
            let tokenContract = await eoslime.AccountDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH, tokenAccount);

            await tokenContract.create(tokenAccount.name, TOTAL_SUPPLY);
            await tokenContract.issue(ACCOUNT_NAME, TOTAL_SUPPLY, 'memo');
        } catch (error) { }
    });

    describe('Instantiation', function () {
        it('Should instantiate correct instance of Account', async () => {
            let localAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            assert(localAccount.name == ACCOUNT_NAME, 'Incorrect name');
            assert(localAccount.privateKey == ACCOUNT_PRIVATE_KEY, 'Incorrect private key');
            assert(localAccount.publicKey == ACCOUNT_PUBLIC_KEY, 'Incorrect public key');
            assert(localAccount.permissions.active.actor == ACCOUNT_NAME, 'Incorrect active actor');
            assert(localAccount.permissions.owner.actor == ACCOUNT_NAME, 'Incorrect owner actor');
            assert(JSON.stringify(localAccount.network) == JSON.stringify(Networks['local']), 'Incorrect local network');

            let jungleAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY, 'jungle');
            assert(JSON.stringify(jungleAccount.network) == JSON.stringify(Networks['jungle']), 'Incorrect jungle network');

            let worbliAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY, 'worbli');
            assert(JSON.stringify(worbliAccount.network) == JSON.stringify(Networks['worbli']), 'Incorrect worbli network');

            let bosAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY, 'bos');
            assert(JSON.stringify(bosAccount.network) == JSON.stringify(Networks['bos']), 'Incorrect bos network');

            let mainAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY, 'main');
            assert(JSON.stringify(mainAccount.network) == JSON.stringify(Networks['main']), 'Incorrect main network');

            let customNetwork = { url: 'Test', chainId: 'Test' };
            let customAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY, customNetwork);
            assert(JSON.stringify(customAccount.network) == JSON.stringify(customNetwork), 'Incorrect custom network');
        });

        it('Should send EOS tokens', async () => {
            const SEND_AMOUNT = '10 SYS';
            let senderAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            // eosio[defualt] account will be the creator of this account
            let receiverAccount = await Account.createRandom();
            let receiverBalanceBeforeSend = await receiverAccount.getBalance(SYSTEM_TOKEN_NAME);
            assert(receiverBalanceBeforeSend == 0, 'Incorrect tokens amount before send');

            await senderAccount.send(receiverAccount, SEND_AMOUNT);

            let receiverBalanceAfterSend = await receiverAccount.getBalance(SYSTEM_TOKEN_NAME);
            assert(receiverBalanceAfterSend == SEND_AMOUNT, 'Incorrect tokens amount after send');
        });

        it('Should load ram from provided payer', async () => {
            let payerAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            // eosio[defualt] account will be the creator of this account
            let account = await Account.createRandom();

            await account.loadRam(payerAccount);

            // Todo: how to check how much ram we have loaded
        });

        it('Should load ram by self', async () => {
            let eosAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            // eosio[defualt] account will be the creator of this account
            let account = await Account.createRandom();

            // Send 10 EOS so the account have enough balance to pay for his ram
            // await eosAccount.send(account, 10);

            await account.loadRam();

            // Todo: think about to return the tx from the operation
        });

        it('Should load bandwidth from provided payer', async () => {
            let payerAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            // eosio[defualt] account will be the creator of this account
            // let account = await Account.createRandom();

            await account.loadBandwidth(payerAccount);

            // Todo: how to check how much bandwidth we have loaded
        });

        it('Should load bandwidth by self', async () => {
            let eosAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            // eosio[defualt] account will be the creator of this account
            let account = await Account.createRandom();

            // Send 10 EOS so the account have enough balance to pay for his bandwidth
            await eosAccount.send(account, 10);

            await account.loadBandwidth();

            // Todo: how to check how much bandwidth we have loaded
        });
    });

    describe('Create from name', function () {

        let accountName;

        it('Should create account from name with provided account', async () => {
            let creatorAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            accountName = createUniqueAccountName('Unique');
            await Account.createFromName(accountName, creatorAccount);

            let eos = new EOSInstance(Networks['local'], ACCOUNT_PRIVATE_KEY);
            assert(await eos.getAccount(accountName), 'Account is not created on blockchain');
        });

        it('Should create account from name with default account', async () => {
            accountName = createUniqueAccountName('Unique');

            await Account.createFromName(accountName);
            let eos = new EOSInstance(Networks['local'], ACCOUNT_PRIVATE_KEY);
            assert(await eos.getAccount(accountName), 'Account is not created on blockchain');
        });

        it('Should throw if one try to create an account on already existing name', async () => {
            try {
                await Account.createFromName(accountName);
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.includes('that name is already taken'));
            }
        });

        it('Should throw if one provide incorrect account as account creator', async () => {
            try {
                accountName = createUniqueAccountName('Unique');

                await Account.createFromName(accountName, 'Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided account is not an instance of Account'));
            }
        });
    });

    describe('Create random', function () {
        it('Should create random account with provided creator', async () => {
            let creatorAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            let newAccount = await Account.createRandom(creatorAccount);

            let eos = new EOSInstance(Networks['local'], ACCOUNT_PRIVATE_KEY);
            assert(await eos.getAccount(newAccount.name), 'Account is not created on blockchain');
        });

        it('Should create random account with default creator', async () => {
            let newAccount = await Account.createRandom();

            let eos = new EOSInstance(Networks['local'], ACCOUNT_PRIVATE_KEY);
            assert(await eos.getAccount(newAccount.name), 'Account is not created on blockchain');
        });

        it('Should throw if one provide incorrect account as account creator', async () => {
            try {
                await Account.createRandom('Fake account');
                assert(false, 'Should throw');

            } catch (error) {
                assert(error.message.includes('Provided account is not an instance of Account'));
            }
        });
    });

    describe('Create randoms', function () {
        it('Should create random accounts with provided creator', async () => {
            let creatorAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            let accounts = await Account.createRandoms(2, creatorAccount);

            assert(accounts.length == 2, 'Incorrect accounts count');

            let eos = new EOSInstance(Networks['local'], ACCOUNT_PRIVATE_KEY);
            for (const account of accounts) {
                assert(await eos.getAccount(account.name), `Account: ${account.name} is not created on blockchain`);
            }
        });

        it('Should create random accounts with default creator', async () => {
            let accounts = await Account.createRandoms(2);

            assert(accounts.length == 2, 'Incorrect accounts count');
            let eos = new EOSInstance(Networks['local'], ACCOUNT_PRIVATE_KEY);
            for (const account of accounts) {
                assert(await eos.getAccount(account.name), `Account: ${account.name} is not created on blockchain`);
            }
        });

        it('Should throw if one provide incorrect account as accounts creator', async () => {
            try {
                await Account.createRandoms('Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided account is not an instance of Account'));
            }
        });
    });

    describe('Create encrypted', function () {

        const PASSWORD = 'secret password';

        it('Should create encrypted account with provided creator', async () => {
            let creatorAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            let encryptedAccount = JSON.parse(await Account.createEncrypted(PASSWORD, creatorAccount));

            let eos = new EOSInstance(Networks['local'], ACCOUNT_PRIVATE_KEY);
            assert(await eos.getAccount(encryptedAccount.name), 'Account is not created on blockchain');
            assert(encryptedAccount.cipherText, 'Cipher is missing');
            assert(encryptedAccount.network, 'Network is missing');
        });

        it('Should create encrypted account with default creator', async () => {
            let encryptedAccount = JSON.parse(await Account.createEncrypted(PASSWORD));

            let eos = new EOSInstance(Networks['local'], ACCOUNT_PRIVATE_KEY);
            assert(await eos.getAccount(encryptedAccount.name), 'Account is not created on blockchain');
            assert(encryptedAccount.cipherText, 'Cipher is missing');
            assert(encryptedAccount.network, 'Network is missing');
        });

        it('Should throw if one provide incorrect account as accounts creator', async () => {
            try {
                await Account.createEncrypted(PASSWORD, 'Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided account is not an instance of Account'));
            }
        });
    });

    describe('From encrypted', function () {

        let encryptedJSONAccount;
        const PASSWORD = 'secret password';

        before(async () => {
            encryptedJSONAccount = await Account.createEncrypted(PASSWORD);
        });

        it('Should convert encrypted account into account', async () => {
            let decryptedJSONAccount = Account.fromEncryptedJson(encryptedJSONAccount, PASSWORD);

            assert(decryptedJSONAccount instanceof Account, 'Expected instance of Account');
            assert(decryptedJSONAccount.name, 'Incorrect name');
            assert(decryptedJSONAccount.privateKey, 'Incorrect private key');
            assert(decryptedJSONAccount.publicKey, 'Incorrect public key');
            assert(JSON.stringify(decryptedJSONAccount.permissions) != "{}", 'Incorrect permissions');
            assert(JSON.stringify(localAccount.network) == JSON.stringify(Networks['local']), 'Incorrect network');
        });

        it('Should throw if one try to convert encrypted account into account and provide incorrect password', async () => {
            try {
                Account.fromEncryptedJson(encryptedJSONAccount, 'Fake password');
                assert(false, 'Should throw');
            } catch (error) {
                // Todo: check for appropriate error
                assert();
            }
        });

        it('Should throw if one try to convert encrypted account into account and provide incorrect json file', async () => {
            try {
                Account.fromEncryptedJson('Fake JSON', PASSWORD);
                assert(false, 'Should throw');
            } catch (error) {
                // Todo: check for appropriate error
                assert();
            }
        });
    });
});
