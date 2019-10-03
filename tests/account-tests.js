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
    kylin: {
        name: 'kylin',
        url: 'https://kylin.eoscanada.com',
        chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'
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
    const EXECUTIVE_AUTHORITY = {
        actor: 'eosio',
        permission: 'active'
    }
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
            const tokenContract = await eoslimeTool.Contract.deployOnAccount(TOKEN_WASM_PATH, TOKEN_ABI_PATH, tokenAccount);
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
        assert(account.executiveAuthority.actor == EXECUTIVE_AUTHORITY.actor, 'Incorrect executive authority actor');
        assert(account.executiveAuthority.permission == EXECUTIVE_AUTHORITY.permission, 'Incorrect executive authority permission');

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

            // Kylin
            let KylinAccount = eoslime.init('kylin').Account;
            let kylinAccount = KylinAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
            assertCorrectAccount(kylinAccount);
        });

        describe('Send tokens', function () {
            it('Should send EOS tokens', async () => {
                const SEND_AMOUNT = '10.0000';
                let senderAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

                let receiverAccount = await Account.createRandom();
                let receiverBalanceBeforeSend = await receiverAccount.getBalance();
                assert(receiverBalanceBeforeSend == 0, 'Incorrect tokens amount before send');

                await senderAccount.send(receiverAccount, SEND_AMOUNT, 'SYS');

                let receiverBalanceAfterSend = await receiverAccount.getBalance('SYS');
                assert(receiverBalanceAfterSend[0] == `${SEND_AMOUNT} SYS`, 'Incorrect tokens amount after send');
            });

            it('Should throw if one tries to send EOS tokens to incorrect account', async () => {
                try {
                    const SEND_AMOUNT = '10.0000';
                    let senderAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                    await senderAccount.send('Fake account', SEND_AMOUNT, 'SYS');

                    assert(false, 'Should throw');
                } catch (error) {
                    assert(error.message.includes('Provided String is not an instance of Account'));
                }
            });
        });

        describe('Buy ram', function () {
            it('Should buy ram [payer]', async () => {
                let payer = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                let account = await Account.createRandom();

                let tx = await account.buyRam(1000, payer);
                assert(tx.transaction.transaction.actions[0].name == 'buyrambytes', 'Incorrect buy ram transaction');
            });

            it('Should buy ram by self', async () => {
                let eosAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                let account = await Account.createRandom();

                // Send 10 EOS to the account in order to have enough balance to pay for his ram
                await eosAccount.send(account, '10.0000', 'SYS');

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

        });

        describe('Buy bandwidth', function () {
            it('Should buy bandwidth [payer]', async () => {
                let payer = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                let account = await Account.createRandom();

                let tx = await account.buyBandwidth('10.0000 SYS', '10.0000 SYS', payer);
                assert(tx.transaction.transaction.actions[0].name == 'delegatebw', 'Incorrect buy bandwidth transaction');
            });

            it('Should buy bandwidth by self', async () => {
                let eosAccount = Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                let account = await Account.createRandom();

                // Send 10 EOS to the account in order to have enough balance to pay for his bandwidth
                await eosAccount.send(account, '10.0000', 'SYS');

                let tx = await account.buyBandwidth('10 SYS', '10 SYS');
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

        describe('Create authority', function () {
            const AUTHORITY = 'contracts';
            const PARENT_AUTHORITY = 'active';

            it('Should create authority', async () => {
                let account = await Account.createRandom();
                let authority = await getAuthorityForAccount(AUTHORITY, account.name);

                assert(authority == undefined);

                const newAuthorityAccount = await account.createAuthority(AUTHORITY);
                assert(newAuthorityAccount.name == account.name);
                assert(newAuthorityAccount.executiveAuthority.actor == newAuthorityAccount.name);
                assert(newAuthorityAccount.executiveAuthority.permission == AUTHORITY);

                authority = await getAuthorityForAccount(AUTHORITY, newAuthorityAccount.name);
                assert(authority.parent == PARENT_AUTHORITY);
            });
        });

        describe('Create permission for authority', function () {
            const AUTHORITY = 'active';
            const PERMISSION = 'eosio.code';

            it('Should create permission for active authority', async () => {
                let account = await Account.createRandom();
                let authority = await getAuthorityForAccount(AUTHORITY, account.name);

                assert(authority.required_auth.accounts.length == 0);

                await account.addPermission(PERMISSION);

                authority = await getAuthorityForAccount(AUTHORITY, account.name);

                assert(authority.required_auth.accounts[0].permission.actor == account.name);
                assert(authority.required_auth.accounts[0].permission.permission = PERMISSION);
            });

            it('Should allow another account to act on behalf', async () => {
                let accounts = await Account.createRandoms(2);
                let child = accounts[0];
                let parent = accounts[1];

                let authority = await getAuthorityForAccount(AUTHORITY, child.name);

                assert(authority.required_auth.accounts.length == 0);

                await child.addPermission(PERMISSION, parent.name);

                authority = await getAuthorityForAccount(AUTHORITY, child.name);

                assert(authority.required_auth.accounts[0].permission.actor == parent.name);
                assert(authority.required_auth.accounts[0].permission.permission = PERMISSION);
            });

            it('Should throw if one try to create a permission for non-existing authority', async () => {
                try {
                    let account = await Account.createRandom();
                    account.executiveAuthority.permission = 'FAKE';

                    await account.addPermission(PERMISSION);

                    assert(false, 'Should throw');
                } catch (error) {
                    assert(error.message.includes('Could not add permission to non-existing authority'));
                }
            });

            it('Should not duplicate an authority permission if it already exists', async () => {
                let account = await Account.createRandom();
                await account.addPermission(PERMISSION);
                await account.addPermission(PERMISSION);

                authority = await getAuthorityForAccount(AUTHORITY, account.name);

                assert(authority.required_auth.accounts.length == 1);
                assert(authority.required_auth.accounts[0].permission.actor == account.name);
                assert(authority.required_auth.accounts[0].permission.permission = PERMISSION);
            });
        });

        const getAuthorityForAccount = async function (authorityName, accountName) {
            let accountInfo = await Provider.eos.getAccount(accountName);
            const authority = accountInfo.permissions.find((permission) => {
                return permission.perm_name == authorityName;
            });

            return authority;
        }
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
            assert(encryptedAccount.authority.actor == encryptedAccount.name, 'Incorrect authority actor');
            assert(encryptedAccount.authority.permission == 'active', 'Incorrect authority permission');
        });

        it('Should create encrypted account [default account]', async () => {
            let encryptedAccount = await Account.createEncrypted(PASSWORD);

            assert(await Provider.eos.getAccount(encryptedAccount.name), 'Account is not created on blockchain');
            assert(encryptedAccount.cipherText, 'Cipher is missing');
            assert(encryptedAccount.network, 'Network is missing');
            assert(encryptedAccount.authority.actor == encryptedAccount.name, 'Incorrect authority actor');
            assert(encryptedAccount.authority.permission == 'active', 'Incorrect authority permission');
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

        beforeEach(async () => {
            encryptedJSONAccount = await Account.createEncrypted(PASSWORD);
        });

        it('Should convert encrypted account into account', async () => {
            let decryptedJSONAccount = Account.fromEncrypted(encryptedJSONAccount, PASSWORD);

            assert(decryptedJSONAccount.constructor.name === 'Account', 'Expected instance of Account');
            assert(decryptedJSONAccount.name, 'Incorrect name');
            assert(decryptedJSONAccount.privateKey, 'Incorrect private key');
            assert(decryptedJSONAccount.publicKey, 'Incorrect public key');
            assert(decryptedJSONAccount.executiveAuthority.actor == decryptedJSONAccount.name, 'Incorrect authority actor');
            assert(decryptedJSONAccount.executiveAuthority.permission == 'active', 'Incorrect authority permission');
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
