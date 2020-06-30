import assert from 'assert';
import { it } from 'mocha';

import { init } from '../../';
const eoslime = init();

import {
    Contract,
    TransactionResult
} from '../../types';

import { assertRawTransaction, assertSignedAction, assertTransactionResult } from './utils';

const ABI_PATH = "./tests/testing-contracts/compiled/faucet.abi";
const WASM_PATH = "./tests/testing-contracts/compiled/faucet.wasm";

describe("Contract", function () {

    const account = eoslime.Account.load('eosio', '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');

    const assertContract = function (contract: Contract): void {
        assert(typeof contract.actions.produce == "function");
        assert(typeof contract.tables.withdrawers !== undefined);


        assert(contract.abi !== undefined);
        assert(contract.name !== undefined);
        assert(contract.executor !== undefined);
    }

    describe("Instantiation", function () {
        it("Should have fromFile function", async () => {
            const contract = eoslime.Contract.fromFile(ABI_PATH, 'contracttest', account);
            assertContract(contract);
        });

        it("Should have at function", async () => {
            const { name } = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            const contract = await eoslime.Contract.at(name, account);
            assertContract(contract);
        });

        it("Should set default account as executor if none is provided", async () => {
            const contract = eoslime.Contract.fromFile(ABI_PATH, 'contracttest');
            assertContract(contract);
        });
    });

    describe("Deployment", function () {
        it("Should have deploy function", async () => {
            const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            assertContract(contract);
        });

        it("Should have deployOnAccount function", async () => {
            const contractAccount = await eoslime.Account.createRandom()
            const contract = await eoslime.Contract.deployOnAccount(WASM_PATH, ABI_PATH, contractAccount);
            assertContract(contract);
        });

        it("Should have deployRaw function", async () => {
            const contract_A = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            const rawWASM = await contract_A.getRawWASM();

            const contract = await eoslime.Contract.deployRaw(rawWASM, contract_A.abi);
            assertContract(contract);
        });

        it("Should have deployRawOnAccount function", async () => {
            const contract_A = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            const rawWASM = await contract_A.getRawWASM();
            const contractAccount = await eoslime.Account.createRandom()

            const contract = await eoslime.Contract.deployRawOnAccount(
                rawWASM,
                contract_A.abi,
                contractAccount
            );
            assertContract(contract);
        });
    });

    describe("Blockchain actions", function () {

        it("Should have blockchain actions", async () => {
            const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            const tx = await contract.actions.test([])

            assertTransactionResult(tx);
        });

        it("Should execute a blockchain action from another executor", async () => {
            const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            await contract.actions.test([], { from: account });
        });

        it('Should process nonce-action', async () => {
            const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            await contract.actions.test([], { unique: true });
        });

        it('Should process token action', async () => {
            const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            await contract.actions.test([], { tokens: '5.0000 SYS' });
        });

        describe("Methods", function () {

            it('Should get a raw transaction from an action', async () => {
                const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
                const rawActionTx = await contract.actions.test.getRawTransaction([]);

                assertRawTransaction(rawActionTx);
            });

            it('Should get a raw transaction from an action with options', async () => {
                const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
                const rawActionTx = await contract.actions.test.getRawTransaction([], { from: account });

                assertRawTransaction(rawActionTx);
            });

            it('Should sign an action without broadcasting it', async () => {
                const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
                const signedActionTx = await contract.actions.test.sign([]);
                assertSignedAction(signedActionTx);
            });

            it('Should sign an action with options without broadcasting it', async () => {
                const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);

                const signer = await eoslime.Account.createRandom();
                const signedActionTx = await contract.actions.test.sign([], { from: signer, unique: true });
                assertSignedAction(signedActionTx);
            });
        });
    });

    describe("Blockchain tables", function () {

        it("Should have a default table getter", async () => {
            const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            assert(typeof contract.tables.withdrawers !== undefined);
        });

        it("Should have table query functions", async () => {
            const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);

            // With equal criteria
            await contract.tables.withdrawers.equal('custom').find();

            // With range criteria
            await contract.tables.withdrawers.range(0, 1).find();

            // With limit
            await contract.tables.withdrawers.limit(10).find();

            // With different index (By Balance)
            await contract.tables.withdrawers.index(2).find();

            // With scope
            await contract.tables.withdrawers.scope(contract.name).find();
        });
    });

    describe("Inline a contract", function () {
        it("Should have makeInline function", async () => {
            const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);

            assert(typeof contract.makeInline == 'function')
            await contract.makeInline();
        });
    });

    describe("Retrieve raw WASM", function () {
        it("Should have getRawWASM function", async () => {
            const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);

            assert(typeof contract.getRawWASM == 'function');
            await contract.getRawWASM();
        });
    });

    describe("Events", function () {
        it("Should have init event", async () => {
            const { name } = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);

            eoslime.Contract.on('init', (contract: Contract) => { assertContract(contract) });
            eoslime.Contract.fromFile(ABI_PATH, name, account);
        });

        it("Should have deploy event", async () => {
            eoslime.Contract.on('deploy', (contract: Contract, deployTx) => {
                assertContract(contract);
                assert(deployTx.length == 2);
            });

            await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
        });

        describe("Blockchain action events", function () {
            it("Should have getRawWASM function", async () => {
                const contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
                contract.actions.test.on('processed', (txReceipt: TransactionResult, ...params: any[]) => {
                    assertTransactionResult(txReceipt);
                    assert(params[0] == contract.executor.name);
                });

                await contract.actions.withdraw([contract.executor.name]);
            });
        });
    });
});
