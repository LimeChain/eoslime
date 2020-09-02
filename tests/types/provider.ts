import assert from 'assert';
import { it } from 'mocha';

import { init } from '../../';
const { Provider } = init();

describe('Provider', function () {

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
            url: 'https://api.kylin.alohaeos.com',
            chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'
        },
        custom: {
            name: 'custom',
            url: 'https://custom.com',
            chainId: '123'
        },
    }

    describe('Instantiation eoslime', function () {
        it('Should instantiate with a correct Provider from connection', async () => {
            // Local
            const localProvider = init().Provider;
            assert(JSON.stringify(localProvider.network) == JSON.stringify(Networks.local));

            // Jungle
            const jungleProvider = init('jungle').Provider;
            assert(JSON.stringify(jungleProvider.network) == JSON.stringify(Networks.jungle));

            // Worbli
            const worbliProvider = init('worbli').Provider;
            assert(JSON.stringify(worbliProvider.network) == JSON.stringify(Networks.worbli));

            // Main
            const mainProvider = init('main').Provider;
            assert(JSON.stringify(mainProvider.network) == JSON.stringify(Networks.main));

            // Bos
            const bosProvider = init('bos').Provider;
            assert(JSON.stringify(bosProvider.network) == JSON.stringify(Networks.bos));

            // Kylin
            const kylinProvider = init('kylin').Provider;
            assert(JSON.stringify(kylinProvider.network) == JSON.stringify(Networks.kylin));

            // Custom
            const customProvider = init({ url: Networks.custom.url, chainId: Networks.custom.chainId }).Provider;
            assert(JSON.stringify(customProvider.network) == JSON.stringify(Networks.custom));
        });

        it('Should instantiate with a correct Provider from provided connection', async () => {

            // Local
            const localProvider = init('local', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(localProvider.network.name) == JSON.stringify(Networks.local.name));
            assert(JSON.stringify(localProvider.network.chainId) == JSON.stringify(Networks.local.chainId));
            assert(JSON.stringify(localProvider.network.url) == JSON.stringify(Networks.custom.url));

            // Jungle
            const jungleProvider = init('jungle', { chainId: Networks.custom.chainId }).Provider;
            assert(JSON.stringify(jungleProvider.network.name) == JSON.stringify(Networks.jungle.name));
            assert(JSON.stringify(jungleProvider.network.url) == JSON.stringify(Networks.jungle.url));
            assert(jungleProvider.network.chainId == Networks.custom.chainId);

            // Worbli
            const worbliProvider = init('worbli', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(worbliProvider.network.name) == JSON.stringify(Networks.worbli.name));
            assert(JSON.stringify(worbliProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(worbliProvider.network.chainId) == JSON.stringify(Networks.worbli.chainId));

            // Main
            const mainProvider = init('main', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(mainProvider.network.name) == JSON.stringify(Networks.main.name));
            assert(JSON.stringify(mainProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(mainProvider.network.chainId) == JSON.stringify(Networks.main.chainId));

            // Bos
            const bosProvider = init('bos', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(bosProvider.network.name) == JSON.stringify(Networks.bos.name));
            assert(JSON.stringify(bosProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(bosProvider.network.chainId) == JSON.stringify(Networks.bos.chainId));

            // Kylin
            const kylinProvider = init('kylin', { url: Networks.custom.url }).Provider;
            assert(JSON.stringify(kylinProvider.network.name) == JSON.stringify(Networks.kylin.name));
            assert(JSON.stringify(kylinProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(kylinProvider.network.chainId) == JSON.stringify(Networks.kylin.chainId));
        });
    });

    describe('Create Provider', function () {
        it('Should be able to create a new Provider with default connection', async () => {
            // Local
            const localProvider = new Provider('local');
            assert(JSON.stringify(localProvider.network) == JSON.stringify(Networks.local));

            // Jungle
            const jungleProvider = new Provider('jungle');
            assert(JSON.stringify(jungleProvider.network) == JSON.stringify(Networks.jungle));

            // Worbli
            const worbliProvider = new Provider('worbli');
            assert(JSON.stringify(worbliProvider.network) == JSON.stringify(Networks.worbli));

            // Main
            const mainProvider = new Provider('main');
            assert(JSON.stringify(mainProvider.network) == JSON.stringify(Networks.main));

            // Bos
            const bosProvider = new Provider('bos');
            assert(JSON.stringify(bosProvider.network) == JSON.stringify(Networks.bos));

            // Kylin
            const kylinProvider = new Provider('kylin');
            assert(JSON.stringify(kylinProvider.network) == JSON.stringify(Networks.kylin));

            // Custom
            const customProvider = new Provider({ url: Networks.custom.url, chainId: Networks.custom.chainId });
            assert(JSON.stringify(customProvider.network) == JSON.stringify(Networks.custom));
        });

        it('Should be able to create a new Provider from connection', async () => {
            // Local
            const localProvider = new Provider('local', { url: Networks.custom.url });
            assert(JSON.stringify(localProvider.network.name) == JSON.stringify(Networks.local.name));
            assert(JSON.stringify(localProvider.network.chainId) == JSON.stringify(Networks.local.chainId));
            assert(JSON.stringify(localProvider.network.url) == JSON.stringify(Networks.custom.url));

            // Jungle
            const jungleProvider = new Provider('jungle', { chainId: Networks.custom.chainId });
            assert(JSON.stringify(jungleProvider.network.name) == JSON.stringify(Networks.jungle.name));
            assert(JSON.stringify(jungleProvider.network.url) == JSON.stringify(Networks.jungle.url));
            assert(jungleProvider.network.chainId == Networks.custom.chainId);

            // Worbli
            const worbliProvider = new Provider('worbli', { url: Networks.custom.url });
            assert(JSON.stringify(worbliProvider.network.name) == JSON.stringify(Networks.worbli.name));
            assert(JSON.stringify(worbliProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(worbliProvider.network.chainId) == JSON.stringify(Networks.worbli.chainId));

            // Main
            const mainProvider = new Provider('main', { url: Networks.custom.url });
            assert(JSON.stringify(mainProvider.network.name) == JSON.stringify(Networks.main.name));
            assert(JSON.stringify(mainProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(mainProvider.network.chainId) == JSON.stringify(Networks.main.chainId));

            // Bos
            const bosProvider = new Provider('bos', { url: Networks.custom.url });
            assert(JSON.stringify(bosProvider.network.name) == JSON.stringify(Networks.bos.name));
            assert(JSON.stringify(bosProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(bosProvider.network.chainId) == JSON.stringify(Networks.bos.chainId));

            // Kylin
            const kylinProvider = new Provider('kylin', { url: Networks.custom.url });
            assert(JSON.stringify(kylinProvider.network.name) == JSON.stringify(Networks.kylin.name));
            assert(JSON.stringify(kylinProvider.network.url) == JSON.stringify(Networks.custom.url));
            assert(JSON.stringify(kylinProvider.network.chainId) == JSON.stringify(Networks.kylin.chainId));
        });
    });

    describe('Reset provider', function () {
        it('Should be able to reset the provider', async () => {
            const jungleProvider = new Provider('jungle');
            Provider.reset(jungleProvider);

            assert(JSON.stringify(Provider.network) == JSON.stringify(Networks.jungle));
        });
    });

    describe('Retrieve table [Table Reader]', function () {

        describe("Select Query", function () {
            it("Should have correct chain of functions", async () => {
                const query = Provider.select('table');
                assert(typeof query.from == 'function');
            });
        });

        describe("From Query", function () {
            it("Should have correct chain of functions", async () => {
                const query = Provider.select('table').from('from');
                assert(typeof query.scope == 'function');
                assert(typeof query.equal == 'function');
                assert(typeof query.range == 'function');
                assert(typeof query.limit == 'function');
                assert(typeof query.index == 'function');
                assert(typeof query.find == 'function');
            });
        });

        describe("Scope Query", function () {
            it("Should have correct chain of functions", async () => {
                const query = Provider.select('table').from('from').scope('scope');
                assert(typeof query.equal == 'function');
                assert(typeof query.range == 'function');
                assert(typeof query.limit == 'function');
                assert(typeof query.index == 'function');
                assert(typeof query.find == 'function');
            });
        });

        describe("Equal Query", function () {
            it("Should have correct chain of functions", async () => {
                const query = Provider.select('table').from('from').scope('scope').equal('equal');
                assert(typeof query.limit == 'function');
                assert(typeof query.index == 'function');
                assert(typeof query.find == 'function');
            });
        });

        describe("Range Query", function () {
            it("Should have correct chain of functions", async () => {
                const query = Provider.select('table').from('from').scope('scope').range(0, 1);
                assert(typeof query.limit == 'function');
                assert(typeof query.index == 'function');
                assert(typeof query.find == 'function');
            });
        });

        describe("Limit Query", function () {
            it("Should have correct chain of functions", async () => {
                const query = Provider.select('table').from('from').scope('scope').limit(10);
                assert(typeof query.equal == 'function');
                assert(typeof query.range == 'function');
                assert(typeof query.index == 'function');
                assert(typeof query.find == 'function');
            });
        });

        describe("Index Query", function () {
            it("Should have correct chain of functions", async () => {
                const query = Provider.select('table').from('from').scope('scope').index(2);
                assert(typeof query.equal == 'function');
                assert(typeof query.range == 'function');
                assert(typeof query.limit == 'function');
                assert(typeof query.find == 'function');
            });
        });
    });

    describe('Retrieve contract ABI', function () {
        it('Should retrieve contract ABI', async () => {
            await Provider.getABI('eosio');
        });
    });

    describe('Retrieve contract raw WASM', function () {
        it('Should retrieve contract raw WASM', async () => {
            await Provider.getRawWASM('eosio');
        });
    });
});
