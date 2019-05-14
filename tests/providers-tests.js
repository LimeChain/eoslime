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

describe('Deployers', function () {

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

    describe('Local Provider', function () {
        it('Should instantiate correct local provider', async () => {



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
    });

    describe('Jungle Provider', function () {
        it('Should instantiate correct jungle provider', async () => {
        });
    });

    describe('Worbli Provider', function () {
        it('Should instantiate correct worbli provider', async () => {
        });
    });

    describe('Main Provider', function () {
        it('Should instantiate correct main provider', async () => {
        });
    });

    describe('Bos Provider', function () {
        it('Should instantiate correct bos provider', async () => {
        });
    });

    describe('Custom Provider', function () {
        it('Should instantiate correct custom provider', async () => {
        });

        it('Should throw if the provided network does not meet the custom\'s template requirements', async () => {

        });
    });

    it('Should throw if one assign to default account non Account instance', async () => {

    });
});
