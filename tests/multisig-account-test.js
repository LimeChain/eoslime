const assert = require('assert');
const eoslime = require('./../').init();


describe('Multi signature account', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    const ACCOUNT_NAME = 'eosio';
    const ACCOUNT_PRIVATE_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';

    const FAUCET_ABI_PATH = "./tests/testing-contracts/compiled/faucet.abi";
    const FAUCET_WASM_PATH = "./tests/testing-contracts/compiled/faucet.wasm";

    let faucetContract;

    beforeEach(async () => {
        faucetContract = await eoslime.Contract.deploy(FAUCET_WASM_PATH, FAUCET_ABI_PATH);
    });

    xdescribe('Buy ram', function () {
        it('Should buy ram [payer]', async () => {
            const account = await eoslime.Account.createRandom();
            const accounts = await eoslime.Account.createRandoms(2);

            await account.addOnBehalfAccount(accounts[0].name);
            await account.addOnBehalfAccount(accounts[1].name);
            await account.setThreshold(2);

            const multiSigAccount = eoslime.Account.loadMultisig(account.name, account.privateKey);
            multiSigAccount.loadAccounts(accounts);

            const payer = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

            const tx = await multiSigAccount.buyRam(1000);
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

    describe('Multi signature transaction', function () {
        it('Should be signed by multiple accounts and be processed', async () => {
            const account = await eoslime.Account.createRandom();
            const accounts = await eoslime.Account.createRandoms(2);

            await account.addOnBehalfAccount(accounts[0].name);
            await account.addOnBehalfAccount(accounts[1].name);
            await account.setThreshold(2);

            const multiSigAccount = eoslime.Account.loadMultisig(account.name, account.privateKey);
            multiSigAccount.loadAccounts(accounts);

            const proposalId = await multiSigAccount.propose(faucetContract.produce, [account.name, "100.0000 TKNS", account.name, "memo"]);
            await multiSigAccount.approve(multiSigAccount.accounts[0], proposalId)
            await multiSigAccount.processProposal(proposalId);

            console.log(await faucetContract.withdrawers.find());
        });

        it('Should be signed by multiple keys and be processed', async () => {
            const account = await eoslime.Account.createRandom();

            const keys = [
                await eoslime.utils.generateKeys(),
                await eoslime.utils.generateKeys()
            ]

            const multiSigAuth = await account.createAuthority('multisig');
            await multiSigAuth.addAuthorityKey(keys[0].publicKey)
            await multiSigAuth.addAuthorityKey(keys[1].publicKey)
            await multiSigAuth.setThreshold(2);

            await account.setAuthorityAbilities('multisig', [
                {
                    action: 'produce',
                    contract: faucetContract.name
                }
            ]);

            const multiSigAccount = eoslime.Account.loadMultisig(multiSigAuth.name, multiSigAuth.privateKey, 'multisig')
            multiSigAccount.loadKeys(keys.map((key) => { return key.privateKey }));

            const proposalId = await multiSigAccount.propose(faucetContract.produce, [multiSigAccount.name, "100.0000 TKNS", multiSigAccount.name, "memo"])

            await multiSigAccount.approve(multiSigAccount.accounts[0], proposalId)
            await multiSigAccount.processProposal(proposalId);

            console.log(await faucetContract.withdrawers.find());
        });
    });
});
