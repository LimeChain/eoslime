const assert = require('assert');
const eoslime = require('./../');


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


const TOKEN_ABI_PATH = "./tests/testing-contracts/compiled/eosio.token.abi";
const TOKEN_WASM_PATH = "./tests/testing-contracts/compiled/eosio.token.wasm";

const FAUCET_ABI_PATH = "./tests/testing-contracts/compiled/faucet.abi";
const FAUCET_WASM_PATH = "./tests/testing-contracts/compiled/faucet.wasm";

describe('Providers', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    describe('Instantiation eoslime', function () {
        it('Should instantiate with a correct Provider from connection', async () => {
            // Local
            const localProvider = eoslime.init().Provider;
            assert(JSON.stringify(localProvider.network) == JSON.stringify(Networks.local));

            // Jungle
            const jungleProvider = eoslime.init('jungle').Provider;
            assert(JSON.stringify(jungleProvider.network) == JSON.stringify(Networks.jungle));

            // Worbli
            const worbliProvider = eoslime.init('worbli').Provider;
            assert(JSON.stringify(worbliProvider.network) == JSON.stringify(Networks.worbli));

            // Main
            const mainProvider = eoslime.init('main').Provider;
            assert(JSON.stringify(mainProvider.network) == JSON.stringify(Networks.main));

            // Bos
            const bosProvider = eoslime.init('bos').Provider;
            assert(JSON.stringify(bosProvider.network) == JSON.stringify(Networks.bos));

            // Kylin
            const kylinProvider = eoslime.init('kylin').Provider;
            assert(JSON.stringify(kylinProvider.network) == JSON.stringify(Networks.kylin));

            // Custom
            const customProvider = eoslime.init({ url: Networks.custom.url, chainId: Networks.custom.chainId }).Provider;
            assert(JSON.stringify(customProvider.network) == JSON.stringify(Networks.custom));
        });

        it('Should instantiate with a correct Provider from provided connection', async () => {

            // Local
            const localProvider = eoslime.init('local', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(localProvider.network.name) == JSON.stringify(Networks.local.name));
            assert(JSON.stringify(localProvider.network.chainId) == JSON.stringify(Networks.local.chainId));
            assert(JSON.stringify(localProvider.network.url) == JSON.stringify(Networks.custom.url));

            // Jungle
            const jungleProvider = eoslime.init('jungle', { chainId: Networks.custom.chainId }).Provider;
            assert(JSON.stringify(jungleProvider.network.name) == JSON.stringify(Networks.jungle.name));
            assert(JSON.stringify(jungleProvider.network.url) == JSON.stringify(Networks.jungle.url));
            assert(jungleProvider.network.chainId == Networks.custom.chainId);

            // Worbli
            const worbliProvider = eoslime.init('worbli', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(worbliProvider.network.name) == JSON.stringify(Networks.worbli.name));
            assert(JSON.stringify(worbliProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(worbliProvider.network.chainId) == JSON.stringify(Networks.worbli.chainId));

            // Main
            const mainProvider = eoslime.init('main', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(mainProvider.network.name) == JSON.stringify(Networks.main.name));
            assert(JSON.stringify(mainProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(mainProvider.network.chainId) == JSON.stringify(Networks.main.chainId));

            // Bos
            const bosProvider = eoslime.init('bos', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(bosProvider.network.name) == JSON.stringify(Networks.bos.name));
            assert(JSON.stringify(bosProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(bosProvider.network.chainId) == JSON.stringify(Networks.bos.chainId));

            // Kylin
            const kylinProvider = eoslime.init('kylin', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(kylinProvider.network.name) == JSON.stringify(Networks.kylin.name));
            assert(JSON.stringify(kylinProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(kylinProvider.network.chainId) == JSON.stringify(Networks.kylin.chainId));
        });

        it('Should throw if one tries to instantiate with invalid custom Provider', async () => {
            try {
                eoslime.init({ customUrl: 'Invalid parameter', chainId: 'Invalid chain id' }).Provider;
            } catch (error) {
                assert(error.message.includes('Invalid network. Custom network should have { url: "Your network", chainId: "Your chainId'))
            }
        });
    });

    describe('Create Provider', function () {
        it('Should be able to create a new Provider with default connection', async () => {
            const eoslimeInstance = eoslime.init();

            // Local
            const localProvider = new eoslimeInstance.Provider('local');
            assert(JSON.stringify(localProvider.network) == JSON.stringify(Networks.local));

            // Jungle
            const jungleProvider = new eoslimeInstance.Provider('jungle');
            assert(JSON.stringify(jungleProvider.network) == JSON.stringify(Networks.jungle));

            // Worbli
            const worbliProvider = new eoslimeInstance.Provider('worbli');
            assert(JSON.stringify(worbliProvider.network) == JSON.stringify(Networks.worbli));

            // Main
            const mainProvider = new eoslimeInstance.Provider('main');
            assert(JSON.stringify(mainProvider.network) == JSON.stringify(Networks.main));

            // Bos
            const bosProvider = new eoslimeInstance.Provider('bos');
            assert(JSON.stringify(bosProvider.network) == JSON.stringify(Networks.bos));

            // Kylin
            const kylinProvider = new eoslimeInstance.Provider('kylin');
            assert(JSON.stringify(kylinProvider.network) == JSON.stringify(Networks.kylin));

            // Custom
            const customProvider = new eoslimeInstance.Provider({ url: Networks.custom.url, chainId: Networks.custom.chainId });
            assert(JSON.stringify(customProvider.network) == JSON.stringify(Networks.custom));
        });

        it('Should be able to create a new Provider from connection', async () => {
            const eoslimeInstance = eoslime.init();

            // Local
            const localProvider = new eoslimeInstance.Provider('local', { url: Networks.custom.url });
            assert(JSON.stringify(localProvider.network.name) == JSON.stringify(Networks.local.name));
            assert(JSON.stringify(localProvider.network.chainId) == JSON.stringify(Networks.local.chainId));
            assert(JSON.stringify(localProvider.network.url) == JSON.stringify(Networks.custom.url));

            // Jungle
            const jungleProvider = new eoslimeInstance.Provider('jungle', { chainId: Networks.custom.chainId });
            assert(JSON.stringify(jungleProvider.network.name) == JSON.stringify(Networks.jungle.name));
            assert(JSON.stringify(jungleProvider.network.url) == JSON.stringify(Networks.jungle.url));
            assert(jungleProvider.network.chainId == Networks.custom.chainId);

            // Worbli
            const worbliProvider = new eoslimeInstance.Provider('worbli', { url: Networks.custom.url });
            assert(JSON.stringify(worbliProvider.network.name) == JSON.stringify(Networks.worbli.name));
            assert(JSON.stringify(worbliProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(worbliProvider.network.chainId) == JSON.stringify(Networks.worbli.chainId));

            // Main
            const mainProvider = new eoslimeInstance.Provider('main', { url: Networks.custom.url });
            assert(JSON.stringify(mainProvider.network.name) == JSON.stringify(Networks.main.name));
            assert(JSON.stringify(mainProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(mainProvider.network.chainId) == JSON.stringify(Networks.main.chainId));

            // Bos
            const bosProvider = new eoslimeInstance.Provider('bos', { url: Networks.custom.url });
            assert(JSON.stringify(bosProvider.network.name) == JSON.stringify(Networks.bos.name));
            assert(JSON.stringify(bosProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(bosProvider.network.chainId) == JSON.stringify(Networks.bos.chainId));

            // Kylin
            const kylinProvider = new eoslimeInstance.Provider('kylin', { url: Networks.custom.url });
            assert(JSON.stringify(kylinProvider.network.name) == JSON.stringify(Networks.kylin.name));
            assert(JSON.stringify(kylinProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(kylinProvider.network.chainId) == JSON.stringify(Networks.kylin.chainId));
        });
    });

    describe('Reset provider', function () {
        it('Should be able to reset the provider', async () => {
            const eoslimeInstance = eoslime.init();

            const localProvider = eoslimeInstance.Provider;
            assert(JSON.stringify(localProvider.network) == JSON.stringify(Networks.local));

            const localAccount = await eoslimeInstance.Account.createRandom();
            assert(JSON.stringify(localAccount.provider.network) == JSON.stringify(Networks.local));

            const jungleProvider = new eoslimeInstance.Provider('jungle');
            eoslimeInstance.Provider.reset(jungleProvider);

            assert(JSON.stringify(localAccount.provider.network) == JSON.stringify(Networks.jungle));
            assert(JSON.stringify(eoslimeInstance.Provider.network) == JSON.stringify(Networks.jungle));
        });
    });

    describe('Retrieve table', function () {

        const TOKEN_PRECISION = Math.pow(10, 4);
        const TOTAL_SUPPLY = "1000000000.0000 TKNS";
        const PRODUCED_TOKENS_AMOUNT = '100.0000 TKNS';

        it('Should retrieve table', async () => {
            const eoslimeInstance = eoslime.init();
            const Provider = eoslimeInstance.Provider;

            const tokenContract = await eoslimeInstance.Contract.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);
            const faucetContract = await eoslimeInstance.Contract.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH);

            await tokenContract.create(faucetContract.name, TOTAL_SUPPLY);
            const tokensHolder = await eoslimeInstance.Account.createRandom();
            await faucetContract.produce(tokensHolder.name, PRODUCED_TOKENS_AMOUNT, tokenContract.name, "memo");

            // With equal criteria
            const equalResult = await Provider.select('withdrawers').from(faucetContract.name).equal(tokensHolder.name).find();
            assert(equalResult[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(equalResult[0].token_name == tokenContract.name);

            // With range criteria
            const rangeResult = await Provider.select('withdrawers').from(faucetContract.name).range(0, 100 * TOKEN_PRECISION).index(2).find();
            assert(rangeResult[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(rangeResult[0].token_name == tokenContract.name);

            // With limit
            // There is only one withdrawer
            const allWithdrawers = await Provider.select('withdrawers').from(faucetContract.name).limit(10).find();
            assert(allWithdrawers.length == 1);
            assert(allWithdrawers[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(allWithdrawers[0].token_name == tokenContract.name);

            // With different index (By Balance)
            const balanceWithdrawers = await Provider.select('withdrawers').from(faucetContract.name).equal(100 * TOKEN_PRECISION).index(2).find();
            assert(balanceWithdrawers[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(balanceWithdrawers[0].token_name == tokenContract.name);

            // With scope
            const allWithdrawersInScope = await Provider.select('withdrawers').from(faucetContract.name).scope(faucetContract.name).find();
            assert(allWithdrawersInScope.length == 1);
            assert(allWithdrawersInScope[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(allWithdrawersInScope[0].token_name == tokenContract.name);
        });

        it('Should throw if one does not provide "select" argument', async () => {
            try {
                const eoslimeInstance = eoslime.init();
                const Provider = eoslimeInstance.Provider;

                const tokenContract = await eoslimeInstance.Contract.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);
                const faucetContract = await eoslimeInstance.Contract.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH);

                await tokenContract.create(faucetContract.name, TOTAL_SUPPLY);
                const tokensHolder = await eoslimeInstance.Account.createRandom();
                await faucetContract.produce(tokensHolder.name, PRODUCED_TOKENS_AMOUNT, tokenContract.name, "memo");

                await Provider.select().find();
            } catch (error) {
                assert(error.message.includes('You should provide select argument'));
            }
        });

        it('Should throw if one does not provide "from" argument', async () => {
            try {
                const eoslimeInstance = eoslime.init();
                const Provider = eoslimeInstance.Provider;

                const tokenContract = await eoslimeInstance.Contract.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);
                const faucetContract = await eoslimeInstance.Contract.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH);

                await tokenContract.create(faucetContract.name, TOTAL_SUPPLY);
                const tokensHolder = await eoslimeInstance.Account.createRandom();
                await faucetContract.produce(tokensHolder.name, PRODUCED_TOKENS_AMOUNT, tokenContract.name, "memo");

                await Provider.select('withdrawers').from().find();
            } catch (error) {
                assert(error.message.includes('You should provide from argument'));
            }
        });

        it('Should throw if one does not provide "scope" argument', async () => {
            try {
                const eoslimeInstance = eoslime.init();
                const Provider = eoslimeInstance.Provider;

                const tokenContract = await eoslimeInstance.Contract.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);
                const faucetContract = await eoslimeInstance.Contract.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH);

                await tokenContract.create(faucetContract.name, TOTAL_SUPPLY);
                const tokensHolder = await eoslimeInstance.Account.createRandom();
                await faucetContract.produce(tokensHolder.name, PRODUCED_TOKENS_AMOUNT, tokenContract.name, "memo");

                await Provider.select('withdrawers').from(faucetContract.name).scope().find();
            } catch (error) {
                assert(error.message.includes('You should provide scope argument'));
            }
        });
    });

    describe('Retrieve contract ABI', function () {
        it('Should retrieve contract ABI', async () => {
            const eoslimeInstance = eoslime.init();
            const Provider = eoslimeInstance.Provider;

            const faucetContract = await eoslimeInstance.Contract.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH);

            const contractABI = await Provider.getABI(faucetContract.name);

            assert(faucetContract.abi.version == contractABI.version);
            assert(JSON.stringify(faucetContract.abi.types) == JSON.stringify(contractABI.types));
            assert(JSON.stringify(faucetContract.abi.structs) == JSON.stringify(contractABI.structs));
            assert(JSON.stringify(faucetContract.abi.actions) == JSON.stringify(contractABI.actions));

            assert(faucetContract.abi.tables[0].name == contractABI.tables[0].name);
            assert(faucetContract.abi.tables[0].type == contractABI.tables[0].type);
            assert(faucetContract.abi.tables[0].index_type == contractABI.tables[0].index_type);
            assert(JSON.stringify(faucetContract.abi.tables[0].key_names) == JSON.stringify(contractABI.tables[0].key_names));
            assert(JSON.stringify(faucetContract.abi.tables[0].key_types) == JSON.stringify(contractABI.tables[0].key_types));
        });
    });

    describe('Retrieve contract raw WASM', function () {
        it('Should retrieve contract raw WASM', async () => {
            const eoslimeInstance = eoslime.init();
            const Provider = eoslimeInstance.Provider;

            const faucetContract = await eoslimeInstance.Contract.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH);

            const contractWASM = await Provider.getRawWASM(faucetContract.name);
            assert(contractWASM.endsWith('='), 'Not correctly encoded WASM');
        });
    });
});
