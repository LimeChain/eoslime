const assert = require('assert');
const eoslime = require('./../').init();

const TOKEN_WASM_PATH = './example/eosio-token/contract/eosio.token.wasm';
const TOKEN_ABI_PATH = './example/eosio-token/contract/eosio.token.abi';


const FAUCET_ABI_PATH = './tests/testing-contracts/abis/faucet.abi';
const FAUCET_WASM_PATH = './tests/testing-contracts/wasms/faucet.wasm';
/*
    You should have running local nodeos in order to run tests
*/

describe('Contract', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    // Faucet account is the account on which the faucet contract is going to be deployed
    let faucetAccount;
    let tokenContract;
    const TOTAL_SUPPLY = '1000000000.0000 TKNS';
    const PRODUCED_TOKENS_AMOUNT = '100.0000 TKNS';

    /*
        Deploy eos token contract on local nodoes in order to send eos and buy ram / bandwidth
    */
    async function createToken() {
        // Deploy a token contract
        try {
            const tokenAccount = await eoslime.Account.createRandom();
            tokenContract = await eoslime.AccountDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH, tokenAccount);
            await tokenContract.create(faucetAccount.name, TOTAL_SUPPLY);
        } catch (error) {
            console.log(error);
        }
    }

    async function createFaucet() {
        // Deploy a faucet contract
        try {
            faucetAccount = await eoslime.Account.createRandom();
            await eoslime.AccountDeployer.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH, faucetAccount);
        } catch (error) {
            console.log(error);
        }
    }

    beforeEach(async () => {
        await createFaucet();
        await createToken();
    });

    describe('Instantiation', function () {
        const CONTRACT_NETWORK = {
            name: 'local',
            url: 'http://127.0.0.1:8888',
            chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
        }

        it('Should instantiate correct instance of Contract', async () => {
            const faucetContract = eoslime.Contract(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);

            assert(typeof faucetContract.produce == 'function');
            assert(typeof faucetContract.withdraw == 'function');

            assert(faucetContract.name == faucetAccount.name);
            assert(JSON.stringify(faucetContract.executor) == JSON.stringify(faucetAccount));
            assert(JSON.stringify(faucetContract.provider.network) == JSON.stringify(CONTRACT_NETWORK));

        });

        it('Should not modify the contract properties directly', async () => {
            const faucetContract = eoslime.Contract(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);

            faucetContract.name = 'Random Name';
            faucetContract.executor = 'Random Executor';
            faucetContract.provider = 'Random Provider';

            assert(faucetContract.name == faucetAccount.name);
            assert(JSON.stringify(faucetContract.executor) == JSON.stringify(faucetAccount));
            assert(JSON.stringify(faucetContract.provider.network) == JSON.stringify(CONTRACT_NETWORK));

        });

        it('Should set default account as executor if none is provided', async () => {
            const faucetContract = eoslime.Contract(FAUCET_ABI_PATH, faucetAccount.name);

            // In local network -> eosio is the preset default account
            assert(JSON.stringify(faucetContract.executor) == JSON.stringify(faucetContract.provider.defaultAccount));
        });

        it('Should throw if one provide incorrect account as a contract executor', async () => {
            try {
                eoslime.Contract(FAUCET_ABI_PATH, faucetAccount.name, "INVALID");

                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('Provided String is not an instance of Account'));
            }
        });

    });

    describe('Blockchain methods', function () {

        it('Should execute a blockchain method from the provided executor', async () => {
            const faucetContract = eoslime.Contract(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();

            // faucetAccount is the executor
            await faucetContract.produce(tokensHolder.name, '100.0000 TKNS', tokenContract.name, 'memo');

            const result = await faucetContract.provider.eos.getTableRows({
                code: faucetContract.name,
                scope: faucetContract.name,
                table: 'withdrawers',
                limit: 1,
                lower_bound: tokensHolder.name,
                upper_bound: tokensHolder.name,
                json: true
            });

            assert(result.rows[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(result.rows[0].token_name == tokenContract.name);
        });


        it('Should execute a blockchain method from another executor', async () => {
            const faucetContract = eoslime.Contract(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();
            const executor = await eoslime.Account.createRandom();

            await faucetContract.produce(tokensHolder.name, '100.0000 TKNS', tokenContract.name, 'memo', { from: executor });

            // After the execution, the contract executor should be the same as the initially provided one
            assert(faucetContract.executor.name == faucetAccount.name);
        });
    });

    describe('Inline a contract', function () {

        it('Should execute a blockchain method which makes inline transaction to another contract', async () => {
            const faucetContract = eoslime.Contract(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            await faucetContract.makeInline();

            const tokensHolder = await eoslime.Account.createRandom();
            await faucetContract.produce(tokensHolder.name, PRODUCED_TOKENS_AMOUNT, tokenContract.name, 'memo');


            const tokensHolderBeforeBalance = await tokensHolder.getBalance('TKNS', tokenContract.name);
            assert(tokensHolderBeforeBalance.length == 0);

            // withdraw method behind the scene calls token's contract issue method
            await faucetContract.withdraw(tokensHolder.name);

            const tokensHolderAfterBalance = await tokensHolder.getBalance('TKNS', tokenContract.name);
            assert(tokensHolderAfterBalance[0] == PRODUCED_TOKENS_AMOUNT);
        });

        it('Should throw if one tries to inline a contract, but the contract\'s executor is not the account on which the contract has been deployed', async () => {
            try {
                const contractExecutor = await eoslime.Account.createRandom();
                const faucetContract = eoslime.Contract(FAUCET_ABI_PATH, faucetAccount.name, contractExecutor);

                await faucetContract.makeInline();

                assert(false, 'Should throw');
            } catch (error) {
                assert(error.message.includes('In order to make a contract inline one, the contract executor should be the account, on which the contract is deployed'));
            }
        });
    });
});