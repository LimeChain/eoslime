const assert = require('assert');
const eoslime = require('./../').init();

const utils = require('./../src/utils');
const createAccountNameFromPublicKey = require('./../src/account/public-key-name-generator').createAccountNameFromPublicKey;

/*
    You should have running local nodeos in order to run tests
*/

describe.only('Features', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    const FAUCET_ABI_PATH = "./tests/testing-contracts/compiled/faucet.abi";
    const FAUCET_WASM_PATH = "./tests/testing-contracts/compiled/faucet.wasm";

    //5KGaQ14gSZxhBeUz4AS6REkbZt5pakhoEhATupcWgHfdraoCycT
    const MSIG_ABI_PATH = "./tests/testing-contracts/compiled/eosio.msig.abi";
    const MSIG_WASM_PATH = "./tests/testing-contracts/compiled/eosio.msig.wasm";

    let faucetAccount;
    let faucetContract;

    beforeEach(async () => {
        try {
            faucetAccount = await eoslime.Account.createRandom();
            faucetContract = await eoslime.Contract.deployOnAccount(FAUCET_WASM_PATH, FAUCET_ABI_PATH, faucetAccount);
        } catch (error) {
            console.log(error);
        }
    });

    describe('Set authority abilities', function () {
        it('Should execute an action from custom authority', async () => {
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

            console.log(await faucetContract.getWithdrawers());
        });

        it('Should execute an action from custom authority', async () => {
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

            console.log(await faucetContract.getWithdrawers());
        });
    });
});
