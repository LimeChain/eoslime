const assert = require('assert');
const eoslime = require('./../').init();

describe('Multi signature account', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    const FAUCET_ABI_PATH = "./tests/testing-contracts/compiled/faucet.abi";
    const FAUCET_WASM_PATH = "./tests/testing-contracts/compiled/faucet.wasm";

    let faucetContract;

    beforeEach(async () => {
        faucetContract = await eoslime.Contract.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH);
    });

    describe('Multi signature transaction', function () {
        it('Should be signed by multiple accounts and be processed', async () => {
            const account = await eoslime.Account.createRandom();
            const accounts = await eoslime.Account.createRandoms(2);

            await account.addOnBehalfAccount(accounts[0].name);
            await account.addOnBehalfAccount(accounts[1].name);
            await account.increaseThreshold(2);

            const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
            multiSigAccount.loadAccounts(accounts);

            const proposalId = await multiSigAccount.propose(faucetContract.actions.produce, [account.name, "100.0000 TKNS", account.name, "memo"]);
            await multiSigAccount.approve(multiSigAccount.accounts[1].publicKey, proposalId);
            await multiSigAccount.processProposal(proposalId);

            const withdrawers = (await faucetContract.tables.withdrawers.find())[0];
            assert(eoslime.utils.toName(withdrawers.account) == account.name);
            assert(withdrawers.quantity == "100.0000 TKNS");
        });

        it('Should be signed by multiple keys and be processed', async () => {
            const account = await eoslime.Account.createRandom();

            const keys = [
                await eoslime.utils.generateKeys(),
                await eoslime.utils.generateKeys()
            ]

            await account.addAuthorityKey(keys[0].publicKey)
            await account.addAuthorityKey(keys[1].publicKey)
            await account.increaseThreshold(2);

            const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
            multiSigAccount.loadKeys(keys.map((key) => { return key.privateKey }));

            const proposalId = await multiSigAccount.propose(faucetContract.actions.produce, [multiSigAccount.name, "100.0000 TKNS", multiSigAccount.name, "memo"])
            await multiSigAccount.approve(multiSigAccount.accounts[1].publicKey, proposalId)
            await multiSigAccount.processProposal(proposalId);

            const withdrawers = (await faucetContract.tables.withdrawers.find())[0];
            assert(eoslime.utils.toName(withdrawers.account) == account.name);
            assert(withdrawers.quantity == "100.0000 TKNS");
        });

        it('Should be approved by all approvers at once', async () => {
            const account = await eoslime.Account.createRandom();
            const accounts = await eoslime.Account.createRandoms(2);

            await account.addOnBehalfAccount(accounts[0].name);
            await account.addOnBehalfAccount(accounts[1].name);
            await account.increaseThreshold(3);

            const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
            multiSigAccount.loadAccounts(accounts);

            const proposalId = await multiSigAccount.propose(faucetContract.actions.produce, [account.name, "100.0000 TKNS", account.name, "memo"]);
            for (let i = 0; i < accounts.length; i++) {
                await multiSigAccount.approve(accounts[i].publicKey, proposalId);
            }

            assert(multiSigAccount.proposals[proposalId].signatures.length == 3);

            await multiSigAccount.processProposal(proposalId);

            const withdrawers = (await faucetContract.tables.withdrawers.find())[0];
            assert(eoslime.utils.toName(withdrawers.account) == account.name);
            assert(withdrawers.quantity == "100.0000 TKNS");
        });
    });

    describe('Propose', function () {
        it('Should should throw if one try to propose an action which is not instance of ContractFunction', async () => {
            try {
                const account = await eoslime.Account.createRandom();
                const accounts = await eoslime.Account.createRandoms(2);

                await account.addOnBehalfAccount(accounts[0].name);
                await account.addOnBehalfAccount(accounts[1].name);
                await account.increaseThreshold(3);

                const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
                multiSigAccount.loadAccounts(accounts);

                const proposalId = await multiSigAccount.propose('Fake function', [account.name, "100.0000 TKNS", account.name, "memo"]);
            } catch (error) {
                assert(error.message.includes('String is not an instance of ContractFunction'))
            }
        });
    });

    describe('Approve', function () {
        it('Should throw if approver was not loaded', async () => {
            try {
                const account = await eoslime.Account.createRandom();
                const accounts = await eoslime.Account.createRandoms(2);

                await account.addOnBehalfAccount(accounts[0].name);
                await account.addOnBehalfAccount(accounts[1].name);
                await account.increaseThreshold(2);

                const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
                multiSigAccount.loadAccounts(accounts);

                const proposalId = await multiSigAccount.propose(faucetContract.actions.produce, [account.name, "100.0000 TKNS", account.name, "memo"]);
                await multiSigAccount.approve('Fake account', proposalId);

                assert(false);
            } catch (error) {
                assert(error.message.includes('Such approver was not loaded'));
            }
        });

        it('Should throw if the proposal does not exists', async () => {
            try {
                const account = await eoslime.Account.createRandom();
                const accounts = await eoslime.Account.createRandoms(2);

                await account.addOnBehalfAccount(accounts[0].name);
                await account.addOnBehalfAccount(accounts[1].name);
                await account.increaseThreshold(2);

                const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
                multiSigAccount.loadAccounts(accounts);

                await multiSigAccount.propose(faucetContract.actions.produce, [account.name, "100.0000 TKNS", account.name, "memo"]);
                await multiSigAccount.approve(multiSigAccount.accounts[1].publicKey, 'Fake proposal');

                assert(false);
            } catch (error) {
                assert(error.message.includes('Such proposal does not exists'));
            }
        });
    });

    describe('Process proposal', function () {

        it('Should throw if the proposal does not exists', async () => {
            try {
                const account = await eoslime.Account.createRandom();
                const accounts = await eoslime.Account.createRandoms(2);

                await account.addOnBehalfAccount(accounts[0].name);
                await account.addOnBehalfAccount(accounts[1].name);
                await account.increaseThreshold(2);

                const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
                multiSigAccount.loadAccounts(accounts);

                const proposalId = await multiSigAccount.propose(faucetContract.actions.produce, [account.name, "100.0000 TKNS", account.name, "memo"]);
                await multiSigAccount.approve(multiSigAccount.accounts[1].publicKey, proposalId);

                await multiSigAccount.processProposal('Fake proposal');

                assert(false);
            } catch (error) {
                assert(error.message.includes('Such proposal does not exists'));
            }
        });

        it('Should throw if the proposal is over approved', async () => {
            try {
                const account = await eoslime.Account.createRandom();
                const accounts = await eoslime.Account.createRandoms(2);

                await account.addOnBehalfAccount(accounts[0].name);
                await account.addOnBehalfAccount(accounts[1].name);
                await account.increaseThreshold(2);

                const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
                multiSigAccount.loadAccounts(accounts);

                const proposalId = await multiSigAccount.propose(faucetContract.actions.produce, [account.name, "100.0000 TKNS", account.name, "memo"]);
                for (let i = 0; i < accounts.length; i++) {
                    await multiSigAccount.approve(accounts[i].publicKey, proposalId);
                }

                await multiSigAccount.processProposal(proposalId);

                assert(false);
            } catch (error) {
                assert(error.message.includes('Proposal should be approved 1 times, but it is approved 2 times. Consider updating the account threshold'));
            }
        });

        it('Should throw if the proposal is under approved', async () => {
            try {
                const account = await eoslime.Account.createRandom();
                const accounts = await eoslime.Account.createRandoms(2);

                await account.addOnBehalfAccount(accounts[0].name);
                await account.addOnBehalfAccount(accounts[1].name);
                await account.increaseThreshold(2);

                const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
                multiSigAccount.loadAccounts(accounts);

                const proposalId = await multiSigAccount.propose(faucetContract.actions.produce, [account.name, "100.0000 TKNS", account.name, "memo"]);
                await multiSigAccount.processProposal(proposalId);

                assert(false);
            } catch (error) {
                assert(error.message.includes('Proposal should be approved 1 times, but it is approved 0 times. Consider updating the account threshold'));
            }
        });
    });

    describe('Load functionality', function () {
        it('Should throw when incorrect private key is provided', async () => {
            try {
                const account = await eoslime.Account.createRandom();
                eoslime.MultiSigAccount.load(account.name, 'Incorrect private key');

                assert(false);
            } catch (error) {
                assert(error.message.includes('Invalid private key. Invalid checksum'))
            }
        });

        it('Should throw if one provide a broken private key on loadKeys', async () => {
            try {
                const account = await eoslime.Account.createRandom();
                const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);

                multiSigAccount.loadKeys(['Fake private key']);

                assert(false);
            } catch (error) {
                assert(error.message.includes('Non-base58 character'))
            }
        });

        it('Should throw if one provide a broken account on loadAccounts', async () => {
            try {
                const account = await eoslime.Account.createRandom();
                const multiSigAccount = eoslime.MultiSigAccount.load(account.name, account.privateKey);
                multiSigAccount.loadAccounts(['Fake account']);

                assert(false);
            } catch (error) {
                assert(error.message.includes('String is not an instance of BaseAccount'));
            }
        });
    });
});
