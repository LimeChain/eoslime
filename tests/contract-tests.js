const assert = require("assert");
const eoslime = require("./../").init();

const TOKEN_ABI_PATH = "./tests/testing-contracts/compiled/eosio.token.abi";
const TOKEN_WASM_PATH = "./tests/testing-contracts/compiled/eosio.token.wasm";

const FAUCET_ABI_PATH = "./tests/testing-contracts/compiled/faucet.abi";
const FAUCET_WASM_PATH = "./tests/testing-contracts/compiled/faucet.wasm";
/*
    You should have running local nodeos in order to run tests
*/

describe("Contract", function () {
    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    // Faucet account is the account on which the faucet contract is going to be deployed
    let faucetAccount;
    let tokenContract;
    const TOKEN_PRECISION = Math.pow(10, 4);
    const TOTAL_SUPPLY = "1000000000.0000 TKNS";
    const PRODUCED_TOKENS_AMOUNT = "100.0000 TKNS";

    /*
        Deploy eos token contract on local nodoes in order to send eos and buy ram / bandwidth
    */
    async function createToken() {
        // Deploy a token contract
        try {
            const tokenAccount = await eoslime.Account.createRandom();
            tokenContract = await eoslime.Contract.deployOnAccount(TOKEN_WASM_PATH, TOKEN_ABI_PATH, tokenAccount);
            await tokenContract.create(faucetAccount.name, TOTAL_SUPPLY);
        } catch (error) {
            console.log(error);
        }
    }

    async function createFaucet() {
        // Deploy a faucet contract
        try {
            faucetAccount = await eoslime.Account.createRandom();
            await eoslime.Contract.deployOnAccount(FAUCET_WASM_PATH, FAUCET_ABI_PATH, faucetAccount);
        } catch (error) {
            console.log(error);
        }
    }

    beforeEach(async () => {
        await createFaucet();
        await createToken();
    });

    describe("Instantiation", function () {
        const CONTRACT_NETWORK = {
            name: "local",
            url: "http://127.0.0.1:8888",
            chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
        };

        it("Should instantiate correct instance of Contract from ABI file", async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);

            assert(typeof faucetContract.produce == "function");
            assert(typeof faucetContract.withdraw == "function");

            assert(faucetContract.name == faucetAccount.name);
            assert(JSON.stringify(faucetContract.executor) == JSON.stringify(faucetAccount));
            assert(JSON.stringify(faucetContract.provider.network) == JSON.stringify(CONTRACT_NETWORK));
        });

        it("Should instantiate correct instance of Contract from blockchain account name", async () => {
            const faucetContract = await eoslime.Contract.at(faucetAccount.name, faucetAccount);

            assert(typeof faucetContract.produce == "function");
            assert(typeof faucetContract.withdraw == "function");

            assert(faucetContract.name == faucetAccount.name);
            assert(JSON.stringify(faucetContract.executor) == JSON.stringify(faucetAccount));
            assert(JSON.stringify(faucetContract.provider.network) == JSON.stringify(CONTRACT_NETWORK));
        });

        it("Should set default account as executor if none is provided", async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name);

            // In local network -> eosio is the preset default account
            assert(JSON.stringify(faucetContract.executor) == JSON.stringify(faucetContract.provider.defaultAccount));
        });

        it("Should throw if one provide incorrect account as a contract executor", async () => {
            try {
                const tokensHolder = await eoslime.Account.createRandom();
                const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, "INVALID");

                eoslime.Provider.defaultAccount = '';
                await faucetContract.produce(tokensHolder.name, "100.0000 TKNS", tokenContract.name, "memo");

                assert(false, "Should throw");
            } catch (error) {
                assert(error.message.includes("Provided String is not an instance of BaseAccount"));
            }
        });
    });

    describe("Blockchain methods", function () {
        it("Should execute a blockchain method from the provided executor", async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();

            // faucetAccount is the executor
            await faucetContract.produce(tokensHolder.name, "100.0000 TKNS", tokenContract.name, "memo");

            const result = await faucetContract.withdrawers.limit(1).equal(tokensHolder.name).find();

            assert(result[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(result[0].token_name == tokenContract.name);
        });

        it("Should execute a blockchain method from another executor", async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();
            const executor = await eoslime.Account.createRandom();

            await faucetContract.produce(tokensHolder.name, "100.0000 TKNS", tokenContract.name, "memo", { from: executor });

            // After the execution, the contract executor should be the same as the initially provided one
            assert(faucetContract.executor.name == faucetAccount.name);
        });

        it('Should process nonce-action', async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();
            const executor = await eoslime.Account.createRandom();

            await faucetContract.produce(tokensHolder.name, '100.0000 TKNS', tokenContract.name, 'memo', { from: executor, unique: true });
            await faucetContract.produce(tokensHolder.name, '100.0000 TKNS', tokenContract.name, 'memo', { from: executor, unique: true });
            assert(true);
        });

        it('Should throw with duplicate transaction error', async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();
            const executor = await eoslime.Account.createRandom();

            try {
                await faucetContract.produce(tokensHolder.name, '100.0000 TKNS', tokenContract.name, 'memo', { from: executor });
                await faucetContract.produce(tokensHolder.name, '100.0000 TKNS', tokenContract.name, 'memo', { from: executor });
            } catch (error) {
                assert(error.includes('duplicate transaction'));
            }
        });

        it('Should get the raw transaction from the action', async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();

            const rawActionTx = await faucetContract.produce.getRawTransaction(tokensHolder.name, '100.0000 TKNS', tokenContract.name, 'memo');
            assert(rawActionTx.expiration != undefined);
            assert(rawActionTx.ref_block_num != undefined);
            assert(rawActionTx.ref_block_prefix != undefined);
            assert(rawActionTx.max_net_usage_words != undefined);
            assert(rawActionTx.max_cpu_usage_ms != undefined);
            assert(rawActionTx.delay_sec != undefined);
            assert(rawActionTx.context_free_actions != undefined);
            assert(rawActionTx.actions != undefined);
            assert(rawActionTx.actions[0].name == 'produce');
            assert(rawActionTx.actions[0].account == faucetContract.name);
            assert(rawActionTx.actions[0].data != undefined);
            assert(rawActionTx.actions[0].authorization != undefined);
        });

        it('Should sign the action without broadcasting it', async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();
            const signer = await eoslime.Account.createRandom();

            const signedActionTx = await faucetContract.produce.sign(signer, tokensHolder.name, '100.0000 TKNS', tokenContract.name, 'memo');

            assert(signedActionTx.signatures.length == 1);
            assert(signedActionTx.transaction.expiration != undefined);
            assert(signedActionTx.transaction.ref_block_num != undefined);
            assert(signedActionTx.transaction.ref_block_prefix != undefined);
            assert(signedActionTx.transaction.max_net_usage_words != undefined);
            assert(signedActionTx.transaction.max_cpu_usage_ms != undefined);
            assert(signedActionTx.transaction.delay_sec != undefined);
            assert(signedActionTx.transaction.context_free_actions != undefined);
            assert(signedActionTx.transaction.actions != undefined);
            assert(signedActionTx.transaction.actions[0].name == 'produce');
            assert(signedActionTx.transaction.actions[0].account == faucetContract.name);
            assert(signedActionTx.transaction.actions[0].data != undefined);
            assert(signedActionTx.transaction.actions[0].authorization != undefined);
        });

        it('Should throw if trying to sign the action with an invalid signer', async () => {
            try {
                const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
                const tokensHolder = await eoslime.Account.createRandom();

                await faucetContract.produce.sign('Fake signer', tokensHolder.name, '100.0000 TKNS', tokenContract.name, 'memo');
            } catch (error) {
                assert(error.message.includes('String is not an instance of BaseAccount'));
            }
        });
    });

    describe("Blockchain tables", function () {

        it("Should have a default table getter", async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);

            // withdrawers is a table in the contract
            assert(faucetContract.withdrawers);
        });

        it("Should apply the default query params if none provided", async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();

            // faucetAccount is the executor
            await faucetContract.produce(tokensHolder.name, "100.0000 TKNS", tokenContract.name, "memo");

            const allWithdrawers = await faucetContract.withdrawers.find();

            assert(allWithdrawers[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(allWithdrawers[0].token_name == tokenContract.name);
        });

        it("Should query a table", async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            const tokensHolder = await eoslime.Account.createRandom();

            // faucetAccount is the executor
            await faucetContract.produce(tokensHolder.name, "100.0000 TKNS", tokenContract.name, "memo");

            // With equal criteria
            const equalResult = await faucetContract.withdrawers.equal(tokensHolder.name).find();
            assert(equalResult[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(equalResult[0].token_name == tokenContract.name);

            // With range criteria
            const rangeResult = await faucetContract.withdrawers.range(0, 100 * TOKEN_PRECISION).index(2).find();
            assert(rangeResult[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(rangeResult[0].token_name == tokenContract.name);

            // With limit
            // There is only one withdrawer
            const allWithdrawers = await faucetContract.withdrawers.limit(10).find();
            assert(allWithdrawers.length == 1);
            assert(allWithdrawers[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(allWithdrawers[0].token_name == tokenContract.name);

            // With different index (By Balance)
            const balanceWithdrawers = await faucetContract.withdrawers.equal(100 * TOKEN_PRECISION).index(2).find();
            assert(balanceWithdrawers[0].quantity == PRODUCED_TOKENS_AMOUNT);
            assert(balanceWithdrawers[0].token_name == tokenContract.name);
        });
    });

    describe("Inline a contract", function () {
        it("Should execute a blockchain method which makes inline transaction to another contract", async () => {
            const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, faucetAccount);
            await faucetContract.makeInline();

            const tokensHolder = await eoslime.Account.createRandom();
            await faucetContract.produce(tokensHolder.name, PRODUCED_TOKENS_AMOUNT, tokenContract.name, "memo");

            const tokensHolderBeforeBalance = await tokensHolder.getBalance("TKNS", tokenContract.name);
            assert(tokensHolderBeforeBalance.length == 0);

            // withdraw method behind the scene calls token's contract issue method
            await faucetContract.withdraw(tokensHolder.name);

            const tokensHolderAfterBalance = await tokensHolder.getBalance("TKNS", tokenContract.name);
            assert(tokensHolderAfterBalance[0] == PRODUCED_TOKENS_AMOUNT);
        });

        it("Should throw if one tries to inline a contract, but the contract's executor is not the account on which the contract has been deployed", async () => {
            try {
                const contractExecutor = await eoslime.Account.createRandom();
                const faucetContract = eoslime.Contract.fromFile(FAUCET_ABI_PATH, faucetAccount.name, contractExecutor);

                await faucetContract.makeInline();

                assert(false, "Should throw");
            } catch (error) {
                assert(
                    error.message.includes(
                        "In order to make a contract inline one, the contract executor should be the account, on which the contract is deployed"
                    )
                );
            }
        });
    });
});
