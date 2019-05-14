const assert = require('assert');
const eoslime = require('./../../').init();

const TOKEN_WASM_PATH = './example/eosio-token/contract/eosio.token.wasm';
const TOKEN_ABI_PATH = './example/eosio-token/contract/eosio.token.abi';

describe('EOSIO Token', function () {

    // Increase mocha(testing framework) time, otherwise tests fails
    this.timeout(15000);

    let tokenContract;
    let tokensIssuer;
    let tokensHolder;

    const TOTAL_SUPPLY = '1000000000.0000 SYS';
    const HOLDER_SUPPLY = '100.0000 SYS';

    before(async () => {
        /* 
            Accounts loader generates random accounts for easier testing
            But you could use it also to create new accounts on each network
            For more details, visit the documentation
        */
        let accounts = await eoslime.Account.createRandoms(2);
        tokensIssuer = accounts[0];
        tokensHolder = accounts[1];
    });

    beforeEach(async () => {
        /*
            CleanDeployer creates for you a new account behind the scene
            on which the contract code is deployed

            Note! CleanDeployer always deploy the contract code on a new fresh account

            You can access the contract account as -> tokenContract.executor
        */
        tokenContract = await eoslime.CleanDeployer.deploy(TOKEN_WASM_PATH, TOKEN_ABI_PATH);
    });

    it('Should create a new token', async () => {
        await tokenContract.create(tokensIssuer.name, TOTAL_SUPPLY);

        /*
            You have access to the EOS(eosjs) instance as -> contract.provider.eos
            This gives us flexibility and convenience

                For example when you want to read a table -> 

                await contract.provider.eos.getTableRows({
                    code: code,
                    scope: scope,
                    table: table,
                    limit: limit,
                    lower_bound: l_bound,
                    upper_bound: u_bound,
                    json: true
                });
        */
        let tokenInitialization = await tokenContract.provider.eos.getCurrencyStats(tokenContract.name, 'SYS');

        assert.equal(tokenInitialization.SYS.max_supply, TOTAL_SUPPLY, 'Incorrect tokens supply');
        assert.equal(tokenInitialization.SYS.issuer, tokensIssuer.name, 'Incorrect tokens issuer');

    });

    it('Should issue tokens', async () => {
        await tokenContract.create(tokensIssuer.name, TOTAL_SUPPLY);
        /*
            On each contract method you can provide an optional object -> { from: account }
            If you don't provide a 'from' object, the method will be executed from the contract account authority
        */
        await tokenContract.issue(tokensHolder.name, HOLDER_SUPPLY, 'memo', { from: tokensIssuer });

        let holderBalance = await tokenContract.provider.eos.getCurrencyBalance(tokenContract.name, tokensHolder.name, 'SYS');
        assert.equal(holderBalance[0], HOLDER_SUPPLY, 'Incorrect holder balance');
    });

    it('Should throw if tokens quantity is negative', async () => {
        await tokenContract.create(tokensIssuer.name, TOTAL_SUPPLY);
        const INVALID_ISSUING_AMOUNT = '-100.0000 SYS';

        /*
            For easier testing, eoslime provides you ('utils.test') with helper functions
        */
        await eoslime.utils.test.expectAssert(
            tokenContract.issue(tokensHolder.name, INVALID_ISSUING_AMOUNT, 'memo', { from: tokensIssuer })
        );

        let holderBalance = await tokenContract.provider.eos.getCurrencyBalance(tokenContract.name, tokensHolder.name, 'SYS');
        assert.equal(holderBalance.length, 0, 'Incorrect holder balance');
    });
});