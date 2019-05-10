const assert = require('assert');
const eoslime = require('./../');
const eoslimeTool = eoslime.init();

const Account = eoslimeTool.Account;
const Provider = eoslimeTool.Provider;

const createAccountNameFromPublicKey = require('./../src/account/public-key-name-generator').createAccountNameFromPublicKey;

/*
    You should have running local nodeos in order to run tests
*/

const Networks = {
    bos: {
        name: 'bos',
        url: 'https://hapi.bos.eosrio.io',
        chainId: 'd5a3d18fbb3c084e3b1f3fa98c21014b5f3db536cc15d08f9f6479517c6a3d86'
    },
    local: {
        name: 'local',
        url: 'http://127.0.0.1:8888',
        chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
    },
    worbli: {
        name: 'main',
        url: 'https://eos.greymass.com',
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
    },
    jungle: {
        name: 'jungle',
        url: 'https://jungle2.cryptolions.io',
        chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473'
    },
    main: {
        name: 'main',
        url: 'https://eos.greymass.com',
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
    },
    custom: {
        name: 'custom',
        url: 'https://custom.com',
        chainId: '123'
    },
}

describe('Account', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    const ACCOUNT_NAME = 'eosio';
    const ACCOUNT_PRIVATE_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
    const ACCOUNT_PUBLIC_KEY = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';

    /*
        Deploy eos token contract on local nodoes in order to send eos and buy ram / bandwidth
    */
    async function createEOSToken() {
        const TOKEN_ABI_PATH = './example/eosio-token/contract/eosio.token.abi';
        const TOKEN_WASM_PATH = './example/eosio-token/contract/eosio.token.wasm';
        const TOTAL_SUPPLY = '1000000000.0000 SYS';

        // Creates eosio.token account if you don't have it
        try {
            const tokenAccount = await Account.createFromName('eosio.token');
            const tokenContract = await eoslimeTool.AccountDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH, tokenAccount);
            await tokenContract.create(tokenAccount.name, TOTAL_SUPPLY);
            await tokenContract.issue(ACCOUNT_NAME, TOTAL_SUPPLY, 'memo');
        } catch (error) {
        }
    }

    before(async () => {
        await createEOSToken();
    });

    function assertCorrectAccount(account) {
        assert(account.name == ACCOUNT_NAME, 'Incorrect name');
        assert(account.privateKey == ACCOUNT_PRIVATE_KEY, 'Incorrect private key');
        assert(account.publicKey == ACCOUNT_PUBLIC_KEY, 'Incorrect public key');
        assert(account.permissions.active.actor == ACCOUNT_NAME, 'Incorrect active actor');
        assert(account.permissions.owner.actor == ACCOUNT_NAME, 'Incorrect owner actor');

        const network = account.provider.network;
        assert(JSON.stringify(account.provider.network) == JSON.stringify(Networks[network.name]))
    }

    describe('Instantiation', function () {
        it('Should instantiate correct instance of Account', async () => {

            // Local
            let LocalAccount = eoslime.init().Account;
            let localAccount = LocalAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            assertCorrectAccount(localAccount);

            // Jungle
            let JungleAccount = eoslime.init('jungle').Account;
            let jungleAccount = JungleAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            assertCorrectAccount(jungleAccount);

            // Worbli
            let WorbliAccount = eoslime.init('worbli').Account;
            let worbliAccount = WorbliAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            assertCorrectAccount(worbliAccount);

            // Main
            let MainAccount = eoslime.init('main').Account;
            let mainAccount = MainAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            assertCorrectAccount(mainAccount);

            // Bos
            let BosAccount = eoslime.init('bos').Account;
            let bosAccount = BosAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            assertCorrectAccount(bosAccount);

            // Custom
            let CustomAccount = eoslime.init({ url: Networks.custom.url, chainId: Networks.custom.chainId }).Account;
            let customAccount = CustomAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            assertCorrectAccount(customAccount);
        });

        it('Should send EOS tokens', async () => {
            const SEND_AMOUNT = '10.0000';
            let senderAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            let receiverAccount = await Account.createRandom();
            let receiverBalanceBeforeSend = await receiverAccount.getBalance();
            assert(receiverBalanceBeforeSend == 0, 'Incorrect tokens amount before send');

            await senderAccount.send(receiverAccount, SEND_AMOUNT);

            let receiverBalanceAfterSend = await receiverAccount.getBalance();
            assert(receiverBalanceAfterSend[0] == `${SEND_AMOUNT} SYS`, 'Incorrect tokens amount after send');
        });

        it('Should throw if one tries to send EOS tokens to incorrect account', async () => {
            try {
                const SEND_AMOUNT = '10.0000';
                let senderAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                await senderAccount.send('Fake account', SEND_AMOUNT);

                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided String is not an instance of Account'));
            }
        });

        it('Should load ram [payer]', async () => {
            let payer = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            let account = await Account.createRandom();

            let tx = await account.buyRam(1000, payer);
            assert(tx.transaction.transaction.actions[0].name == 'buyrambytes', 'Incorrect buy ram transaction');
        });

        it('Should load ram by self', async () => {
            let eosAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            let account = await Account.createRandom();

            // Send 10 EOS to the account in order to have enough balance to pay for his ram
            await eosAccount.send(account, '10.0000');

            let tx = await account.buyRam(1000);
            assert(tx.transaction.transaction.actions[0].name == 'buyrambytes', 'Incorrect buy ram transaction');
        });

        it('Should throw if one provide incorrect account as ram payer', async () => {
            try {
                let eosAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                await eosAccount.buyRam(1000, 'Fake account');

                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided String is not an instance of Account'));
            }
        });

        it('Should load bandwidth [payer]', async () => {
            let payer = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            let account = await Account.createRandom();

            let tx = await account.buyBandwidth(10, 10, payer);
            assert(tx.transaction.transaction.actions[0].name == 'delegatebw', 'Incorrect buy bandwidth transaction');
        });

        it('Should load bandwidth by self', async () => {
            let eosAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            let account = await Account.createRandom();

            // Send 10 EOS to the account in order to have enough balance to pay for his bandwidth
            await eosAccount.send(account, '10.0000');

            let tx = await account.buyBandwidth(10, 19);
            assert(tx.transaction.transaction.actions[0].name == 'delegatebw', 'Incorrect buy bandwidth transaction');
        });

        it('Should throw if one provide incorrect account as bandwidth payer', async () => {
            try {
                let eosAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                await eosAccount.buyBandwidth(10, 19, 'Fake account');

                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided String is not an instance of Account'));
            }
        });
    });

    describe('Create from name', function () {

        it('Should create account from name [account creator]', async () => {
            let creatorAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            // We are using Date.now() in order name to be 'unique'
            let accountName = createAccountNameFromPublicKey(Date.now());
            await Account.createFromName(accountName, creatorAccount);

            assert(await Provider.eos.getAccount(accountName), 'Account is not created on blockchain');
        });

        it('Should create account from name [default account]', async () => {
            // We are using Date.now() in order name to be 'unique'
            let accountName = createAccountNameFromPublicKey(Date.now());
            await Account.createFromName(accountName);

            assert(await Provider.eos.getAccount(accountName), 'Account is not created on blockchain');
        });

        it('Should throw if one try to create an account on already existing name', async () => {
            try {
                await Account.createFromName(ACCOUNT_NAME);
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.includes('that name is already taken'));
            }
        });

        it('Should throw if one provide incorrect account as account creator', async () => {
            try {
                // We are using Date.now() in order name to be 'unique'
                let accountName = createAccountNameFromPublicKey(Date.now());

                await Account.createFromName(accountName, 'Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided String is not an instance of Account'));
            }
        });
    });

    describe('Create random', function () {
        it('Should create random account [account creator]', async () => {
            let creatorAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            let newAccount = await Account.createRandom(creatorAccount);

            assert(await Provider.eos.getAccount(newAccount.name), 'Account is not created on blockchain');
        });

        it('Should create random account [default account]', async () => {
            let newAccount = await Account.createRandom();
            assert(await Provider.eos.getAccount(newAccount.name), 'Account is not created on blockchain');
        });

        it('Should throw if one provide incorrect account as account creator', async () => {
            try {
                await Account.createRandom('Fake account');
                assert(false, 'Should throw');

            } catch (error) {
                assert(error.message.includes('Provided String is not an instance of Account'));
            }
        });
    });

    describe('Create randoms', function () {
        it('Should create random accounts [account creator]', async () => {
            let creatorAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            let accounts = await Account.createRandoms(2, creatorAccount);
            assert(accounts.length == 2, 'Incorrect accounts count');

            for (const account of accounts) {
                assert(await Provider.eos.getAccount(account.name), `Account: ${account.name} is not created on blockchain`);
            }
        });

        it('Should create random accounts [default account]', async () => {
            let accounts = await Account.createRandoms(2);
            assert(accounts.length == 2, 'Incorrect accounts count');

            for (const account of accounts) {
                assert(await Provider.eos.getAccount(account.name), `Account: ${account.name} is not created on blockchain`);
            }
        });

        it('Should throw if one provide incorrect account as accounts creator', async () => {
            try {
                await Account.createRandoms(2, 'Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided String is not an instance of Account'));
            }
        });
    });

    describe('Create encrypted', function () {

        const PASSWORD = 'secret password';

        it('Should create encrypted account [account creator]', async () => {
            let creatorAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            let encryptedAccount = await Account.createEncrypted(PASSWORD, creatorAccount);

            assert(await Provider.eos.getAccount(encryptedAccount.name), 'Account is not created on blockchain');
            assert(encryptedAccount.cipherText, 'Cipher is missing');
            assert(encryptedAccount.network, 'Network is missing');
        });

        it('Should create encrypted account [default account]', async () => {
            let encryptedAccount = await Account.createEncrypted(PASSWORD);

            assert(await Provider.eos.getAccount(encryptedAccount.name), 'Account is not created on blockchain');
            assert(encryptedAccount.cipherText, 'Cipher is missing');
            assert(encryptedAccount.network, 'Network is missing');
        });

        it('Should throw if one provide incorrect account as accounts creator', async () => {
            try {
                await Account.createEncrypted(PASSWORD, 'Fake account');
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided String is not an instance of Account'));
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
            let decryptedJSONAccount = Account.fromEncrypted(encryptedJSONAccount, PASSWORD);

            assert(decryptedJSONAccount.constructor.name === 'Account', 'Expected instance of Account');
            assert(decryptedJSONAccount.name, 'Incorrect name');
            assert(decryptedJSONAccount.privateKey, 'Incorrect private key');
            assert(decryptedJSONAccount.publicKey, 'Incorrect public key');
            assert(JSON.stringify(decryptedJSONAccount.permissions) != "{}", 'Incorrect permissions');
            assert(JSON.stringify(decryptedJSONAccount.provider.network) == JSON.stringify(Networks['local']), 'Incorrect network');
        });

        it('Should throw if one try to convert encrypted account with incorrect password', async () => {
            try {
                Account.fromEncrypted(encryptedJSONAccount, 'Fake password');
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Account decryption: Couldn\'t decrypt the data'));
            }
        });

        it('Should throw if one try to convert encrypted account with incorrect json file', async () => {
            try {
                Account.fromEncrypted('Fake JSON', PASSWORD);
                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Account decryption: Couldn\'t decrypt the data'));
            }
        });

        it('Should throw if one try to decrypt another network account', async () => {
            try {
                let jungleInstance = eoslime.init('jungle');
                jungleInstance.Account.fromEncrypted(encryptedJSONAccount, PASSWORD);

                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Broken account. Most of time reason: invalid network'));
            }
        });
    });
});
