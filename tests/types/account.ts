import assert from 'assert';
import { it } from 'mocha';

import { init, utils } from '../../';
const eoslime = init();

import {
    Contract,
    Account,
    MultiSignatureAccount
} from '../../types';

import { assertTransactionResult } from './utils';

describe('All types of accounts', function () {

    const ACCOUNT_NAME = 'eosio';
    const ACCOUNT_PRIVATE_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';

    const ABI_PATH = "./tests/testing-contracts/compiled/faucet.abi";
    const WASM_PATH = "./tests/testing-contracts/compiled/faucet.wasm";

    describe('Normal Account', function () {

        function assertAccount (account: Account) {
            assert(account.name !== undefined);
            assert(account.provider !== undefined);
            assert(account.publicKey !== undefined);
            assert(account.privateKey !== undefined);
            assert(account.executiveAuthority.actor !== undefined);
            assert(account.executiveAuthority.permission !== undefined);

            assert(typeof (account.send) == 'function');
            assert(typeof (account.buyRam) == 'function');
            assert(typeof (account.setWeight) == 'function');
            assert(typeof (account.getBalance) == 'function');
            assert(typeof (account.buyBandwidth) == 'function');
            assert(typeof (account.addPermission) == 'function');
            assert(typeof (account.addAuthorityKey) == 'function');
            assert(typeof (account.getAuthorityInfo) == 'function');
            assert(typeof (account.increaseThreshold) == 'function');
            assert(typeof (account.createSubAuthority) == 'function');
            assert(typeof (account.addOnBehalfAccount) == 'function');
        }

        describe('Static functions', function () {
            it('Should load account', async () => {
                const account = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                assertAccount(account);
            });

            it('Should create account [account creator]', async () => {
                const creatorAccount = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

                const accountName = await utils.randomName();
                const privateKey = await utils.randomPrivateKey();

                const account = await eoslime.Account.create(accountName, privateKey, creatorAccount);
                assertAccount(account);
            });

            it('Should create account [default account]', async () => {
                const accountName = await utils.randomName();
                const privateKey = await utils.randomPrivateKey();

                const account = await eoslime.Account.create(accountName, privateKey);
                assertAccount(account);
            });

            it('Should create account from name [account creator]', async () => {
                const creatorAccount = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

                const accountName = await utils.randomName();
                const account = await eoslime.Account.createFromName(accountName, creatorAccount);
                assertAccount(account);
            });

            it('Should create account from name [default account]', async () => {
                const accountName = await utils.randomName();
                const account = await eoslime.Account.createFromName(accountName);

                assertAccount(account);
            });

            it('Should create random account [account creator]', async () => {
                const creatorAccount = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                const account = await eoslime.Account.createRandom(creatorAccount);

                assertAccount(account);
            });

            it('Should create random account [default account]', async () => {
                const account = await eoslime.Account.createRandom();
                assertAccount(account);
            });

            it('Should create random accounts [account creator]', async () => {
                const creatorAccount = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);

                const accounts = await eoslime.Account.createRandoms(2, creatorAccount);
                for (const account of accounts) {
                    assertAccount(account);
                }
            });

            it('Should create random accounts [default account]', async () => {
                const accounts = await eoslime.Account.createRandoms(2);
                for (const account of accounts) {
                    assertAccount(account);
                }
            });

            it('Should create encrypted account [account creator]', async () => {
                const creatorAccount = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                const encryptedAccount = await eoslime.Account.createEncrypted('PASSWORD', creatorAccount);

                assert(encryptedAccount.network);
                assert(encryptedAccount.cipherText);
                assert(encryptedAccount.authority.actor);
                assert(encryptedAccount.authority.permission);
            });

            it('Should create encrypted account [default account]', async () => {
                const encryptedAccount = await eoslime.Account.createEncrypted('PASSWORD');

                assert(encryptedAccount.network);
                assert(encryptedAccount.cipherText);
                assert(encryptedAccount.authority.actor);
                assert(encryptedAccount.authority.permission);
            });

            it('Should convert encrypted account into account', async () => {
                const encryptedAccount = await eoslime.Account.createEncrypted('PASSWORD');
                const decryptedAccount = eoslime.Account.fromEncrypted(encryptedAccount, 'PASSWORD');

                assertAccount(decryptedAccount);
            });
        });

        describe('Main functions', function () {

            it('Should send EOS tokens', async () => {
                const SEND_AMOUNT = '10.0000';
                const senderAccount = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                const receiverAccount = await eoslime.Account.createRandom();

                const tx = await senderAccount.send(receiverAccount, SEND_AMOUNT, 'SYS');
                assertTransactionResult(tx);
            });

            it('Should buy ram [payer]', async () => {
                const payer = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                const account = await eoslime.Account.createRandom();

                const tx = await account.buyRam(1000, payer);
                assertTransactionResult(tx);
            });

            it('Should buy ram by self', async () => {
                const eosAccount = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                const account = await eoslime.Account.createRandom();

                await eosAccount.send(account, '10.0000', 'SYS');

                const tx = await account.buyRam(1000);
                assertTransactionResult(tx);
            });

            it('Should buy bandwidth [payer]', async () => {
                const payer = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                const account = await eoslime.Account.createRandom();

                const tx = await account.buyBandwidth('10.0000 SYS', '10.0000 SYS', payer);
                assertTransactionResult(tx);
            });

            it('Should buy bandwidth by self', async () => {
                const eosAccount = eoslime.Account.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                const account = await eoslime.Account.createRandom();

                await eosAccount.send(account, '10.0000', 'SYS');

                const tx = await account.buyBandwidth('10 SYS', '10 SYS');
                assertTransactionResult(tx);
            });

            it('Should create authority', async () => {
                const account = await eoslime.Account.createRandom();
                const newAuthorityAccount = await account.createSubAuthority('custom');

                assertAccount(newAuthorityAccount);
                assert(typeof (newAuthorityAccount.setAuthorityAbilities) == 'function');
            });

            it('Should create permission for active authority', async () => {
                const account = await eoslime.Account.createRandom();
                const tx = await account.addPermission('eosio.code');

                assertTransactionResult(tx);
            });

            it('Should add permission with weight', async () => {
                const accounts = await eoslime.Account.createRandom();
                const tx = await accounts.addPermission('eosio.code', 2);

                assertTransactionResult(tx);
            });

            it('Should allow another a keys pair to act on behalf', async () => {
                const account = await eoslime.Account.createRandom();
                const keysPair = await utils.generateKeys();

                const tx = await account.addAuthorityKey(keysPair.publicKey);
                assertTransactionResult(tx);
            });

            it('Should add keys pair with weight', async () => {
                const WEIGHT = 2;

                const account = await eoslime.Account.createRandom();
                const keysPair = await utils.generateKeys();

                const tx = await account.addAuthorityKey(keysPair.publicKey, WEIGHT);
                assertTransactionResult(tx);
            });

            it('Should allow another account to act on behalf', async () => {
                const accounts = await eoslime.Account.createRandoms(2);
                const child = accounts[0];
                const parent = accounts[1];

                const tx = await child.addOnBehalfAccount(parent.name, 'active');
                assertTransactionResult(tx);
            });

            it('Should add authority account with weight', async () => {
                const WEIGHT = 2;

                const accounts = await eoslime.Account.createRandoms(2);
                const child = accounts[0];
                const parent = accounts[1];

                const tx = await child.addOnBehalfAccount(parent.name, 'active', WEIGHT);
                assertTransactionResult(tx);
            });

            it('Should increase authority threshold', async () => {
                const THRESHOLD = 2;
                const account = await eoslime.Account.createRandom();

                const keysPair = await utils.generateKeys();
                await account.addAuthorityKey(keysPair.publicKey);
                const tx = await account.increaseThreshold(THRESHOLD);

                assertTransactionResult(tx);
            });

            it('Should set weight correctly authority threshold', async () => {
                const account = await eoslime.Account.createRandom();

                const WEIGHT = 2;
                const tx = await account.setWeight(WEIGHT);

                assertTransactionResult(tx);
            });

            it('Should get authority details', async () => {
                const account = await eoslime.Account.createRandom();
                const authorityInfo = await account.getAuthorityInfo();

                assert(authorityInfo.perm_name)
                assert(authorityInfo.parent)
                assert(authorityInfo.required_auth.threshold)
                assert(Array.isArray(authorityInfo.required_auth.keys))
                assert(Array.isArray(authorityInfo.required_auth.accounts))
                assert(Array.isArray(authorityInfo.required_auth.waits))
            });

            it('Should get balance', async () => {
                const account = await eoslime.Account.createRandom();
                const accBalance = await account.getBalance();

                assert(accBalance.length == 0);
            });
        });
    });

    describe('Authority Account', function () {
        it('Should set authority abilities', async () => {
            const { name } = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);

            const account = await eoslime.Account.createRandom();
            const authorityAccount = await account.createSubAuthority('custom');

            const tx = await authorityAccount.setAuthorityAbilities([
                {
                    action: 'test',
                    contract: name
                }
            ]);

            assertTransactionResult(tx);
        });
    });

    describe('MultiSignature Account', function () {
        function assertMultiSigAccount (account: MultiSignatureAccount) {
            assert(account.name);
            assert(account.accounts);
            assert(account.provider);
            assert(account.proposals);
            assert(account.publicKey);
            assert(account.privateKey);
            assert(account.executiveAuthority.actor);
            assert(account.executiveAuthority.permission);

            assert(typeof (account.loadKeys) == 'function');
            assert(typeof (account.loadAccounts) == 'function');

            assert(typeof (account.propose) == 'function');
            assert(typeof (account.approve) == 'function');
            assert(typeof (account.processProposal) == 'function');
        }

        describe('Static functions', function () {
            it('Should load multi signature account', async () => {
                const account = eoslime.MultiSigAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                assertMultiSigAccount(account);
            });
        });

        describe('Main functions', function () {

            let contract: Contract;

            // TODO: Implement stub version
            beforeEach(async () => {
                contract = await eoslime.Contract.deploy(WASM_PATH, ABI_PATH);
            });

            it('Should load more keys', async () => {
                const keys = [
                    (await utils.generateKeys()).privateKey,
                    (await utils.generateKeys()).privateKey
                ];

                const multiSigAccount = eoslime.MultiSigAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                multiSigAccount.loadKeys(keys);
            });

            it('Should load more accounts', async () => {
                const accounts = await eoslime.Account.createRandoms(2);

                const multiSigAccount = eoslime.MultiSigAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                multiSigAccount.loadAccounts(accounts);
            });

            it('Should propose a transaction to be broadcasted', async () => {
                const multiSigAccount = eoslime.MultiSigAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                const proposalId = await multiSigAccount.propose(contract.actions.test, []);

                assert(proposalId);
            });

            it('Should approve a transaction for broadcasting', async () => {
                const multiSigAccount = eoslime.MultiSigAccount.load(ACCOUNT_NAME, ACCOUNT_PRIVATE_KEY);
                const proposalId = await multiSigAccount.propose(contract.actions.test, []);

                await multiSigAccount.approve(multiSigAccount.publicKey, proposalId);
            });

            it('Should broadcast a proposed transaction', async () => {
                const { name, privateKey } = await eoslime.Account.createRandom();

                const multiSigAccount = eoslime.MultiSigAccount.load(name, privateKey);
                const proposalId = await multiSigAccount.propose(contract.actions.test, []);

                const tx = await multiSigAccount.processProposal(proposalId);
                assert(tx.processed !== undefined);
                assert(tx.transaction_id !== undefined);
            });
        });
    });
});
