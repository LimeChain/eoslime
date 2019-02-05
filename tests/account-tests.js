const assert = require('assert');
const Account = require('./../').Account;
const Networks = require('./../src/helpers/networks.json');

/*
    You should have running local nodeos in order to run tests
*/

describe('Account', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    // this.timeout(15000);

    const ACCOUNT_NAME = 'eosio';
    const ACCOUNT_PRIVATE_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
    const ACCOUNT_PUBLIC_KEY = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';

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
            let senderAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            // eosio[defualt] account will be the creator of this account
            let receiverAccount = await Account.createRandom();

            //senderAccount.send(receiverAccount, 10);

            // Todo: Assert balance
        });

        it('Should load ram from provided payer', async () => {
            let payerAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            // eosio[defualt] account will be the creator of this account
            let account = await Account.createRandom();

            await account.loadRam({ payer: payerAccount });

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

            await account.loadBandwidth({ payer: payerAccount });

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
        it('Should create account from name with provided account', async () => {
            let creatorAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            await Account.createFromName('test', creatorAccount);

            // Todo: get account info and check the creator
        });

        it('Should create account from name with default account', async () => {
            await Account.createFromName('test1');
        });

        it('Should throw if one try to create an account on already existing name', async () => {
            try {
                await Account.createFromName('test');
                assert(false, 'Should throw');
            } catch (error) {
                // Todo: check for appropriate error
                assert();
            }
        });

        it('Should throw if one provide incorrect account as account creator', async () => {
            try {
                await Account.createFromName('test2', 'Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                // Todo: check for appropriate error
                assert();
            }
        });
    });

    describe('Create random', function () {
        it('Should create random account with provided creator', async () => {
            let creatorAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            await Account.createRandom(creatorAccount);

            // Todo: get account info and check the creator
        });

        it('Should create random account with default creator', async () => {
            await Account.createRandom();

            // Todo: get account info and check the creator
        });

        it('Should throw if one provide incorrect account as account creator', async () => {
            try {
                await Account.createRandom('Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                // Todo: check for appropriate error
                assert();
            }
        });
    });

    describe('Create randoms', function () {
        it('Should create random accounts with provided creator', async () => {
            let creatorAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            let accounts = await Account.createRandoms(2, creatorAccount);

            assert(accounts.length == 2, 'Incorrect accounts count');
            // Todo: get account info and check the creator
        });

        it('Should create random accounts with default creator', async () => {
            let accounts = await Account.createRandoms(2);

            assert(accounts.length == 2, 'Incorrect accounts count');
            // Todo: get account info and check the creator
        });

        it('Should throw if one provide incorrect account as accounts creator', async () => {
            try {
                await Account.createRandoms('Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                // Todo: check for appropriate error
                assert();
            }
        });
    });

    describe('Create encrypted', function () {

        const PASSWORD = 'secret password';

        it('Should create encrypted account with provided creator', async () => {
            let creatorAccount = new Account(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            await Account.createEncrypted(PASSWORD, creatorAccount);

            // Todo: get account info and check the creator
        });

        it('Should create encrypted account with default creator', async () => {
            await Account.createEncrypted(PASSWORD);

            // Todo: get account info and check the creator
        });

        it('Should throw if one provide incorrect account as accounts creator', async () => {
            try {
                await Account.createEncrypted(PASSWORD, 'Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                // Todo: check for appropriate error
                assert();
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
