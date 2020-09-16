const path = require('path');
const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

const Command = require('../../cli-commands/commands/command');
const TestCommand = require('../../cli-commands/commands/test/index');

const NetworkOption = require('../../cli-commands/commands/test/options/network-option');
const ResourceReportOption = require('../../cli-commands/commands/test/options/resource-usage-option');

const definition = require('../../cli-commands/commands/test/definition');

const Logger = require('./utils/logger');
const logger = new Logger();

const eoslime = require('../../').init();
const MochaFramework = require('../../cli-commands/commands/test/specific/test-frameworks/mocha');

describe('Test Command', function () {

    this.timeout(10000);

    beforeEach(async () => {
        logger.hide(sinon);
    });

    afterEach(async () => {
        sinon.restore();
    });

    describe('Command', function () {

        it('Should initialize command properly', async () => {
            const testCommand = new TestCommand();
            assert(testCommand instanceof Command);
            assert(testCommand.template == definition.template);
            assert(testCommand.description = definition.description);
            assert(testCommand.options == definition.options);
            assert(testCommand.subcommands.length == 0);
        });

        it('Should run test scripts', async () => {
            const checkPoint = {
                runTests: 1,
                setDescribeArgs: 1
            }

            const testCommand = new TestCommand(class TestFramework {
                setDescribeArgs () { checkPoint.setDescribeArgs--; }
                runTests () { checkPoint.runTests--; }
            });

            const args = {};
            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('success', (message) => {
                    if (message.includes('Testing completed successfully')) {
                        return resolve(true);
                    }
                });

                await testCommand.execute(args);
            });

            await waitToPass;

            assert(args.eoslime.tests);
            assert(checkPoint.runTests == 0);
            assert(checkPoint.setDescribeArgs == 0);
        });

        it('Should log error message in case of error', async () => {
            // Because no test framework has been provided, it will throw
            const testCommand = new TestCommand();

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('error', (message, error) => {
                    if (message.includes('Testing failed')) {
                        return resolve(true);
                    }
                });

                await testCommand.execute();
            });

            await waitToPass;
        });
    });

    describe('Options', function () {

        describe('Path', function () {

            function stubFileSystemUtils (isFolder) {
                return {
                    '../../../helpers/file-system-util': {
                        isDir: () => { return isFolder; },
                        isFile: () => { return !isFolder; },
                        recursivelyReadDir: (dir) => {
                            return [{ fullPath: `${dir}/fullPath` }];
                        }
                    }
                }
            }

            it('Should load a test script into the test framework', async () => {
                const pathOption = proxyquire('../../cli-commands/commands/test/options/path-option', {
                    ...stubFileSystemUtils(false)
                });

                await pathOption.process('./custom.js',
                    {
                        testFramework: {
                            addTestFiles: (files) => { assert(files[0] == path.resolve('./', './custom.js')); }
                        }
                    }
                );
            });

            it('Should load all test scripts from a folder into the test framework', async () => {
                const pathOption = proxyquire('../../cli-commands/commands/test/options/path-option', {
                    ...stubFileSystemUtils(true)
                });

                await pathOption.process('./custom',
                    {
                        testFramework: {
                            addTestFiles: (files) => { assert(files[0] == './custom/fullPath'); }
                        }
                    }
                );
            });
        });

        describe('Network', function () {
            const eoslime = require('../../').init();

            it('Should set eoslime on provided network', async () => {
                NetworkOption.process('jungle', { eoslime });
                assert(eoslime.Provider.network.name == 'jungle');
            });

            it('Should set eoslime on local network none has been provided', async () => {
                NetworkOption.process(undefined, { eoslime });
                assert(eoslime.Provider.network.name == 'local');
            });
        });

        describe('Resources usage report', function () {

            const FAUCET_ABI_PATH = "./tests/testing-contracts/compiled/faucet.abi";
            const FAUCET_WASM_PATH = "./tests/testing-contracts/compiled/faucet.wasm";

            it('Should show correct data in report', async () => {
                const testFramework = new MochaFramework();

                const waitToPass = new Promise(async (resolve, reject) => {
                    const contractAccount = await eoslime.Account.createRandom();

                    // The result is a table visualization
                    // Because of that we are waiting for the table output to check if all good
                    logger.on('log', () => {
                        const table = ResourceReportOption.reportTable.table;
                        assert(JSON.stringify(table.options.head) == JSON.stringify([
                            '',
                            'Contract',
                            'Action',
                            'CPU ( MIN | MAX )',
                            'NET ( MIN | MAX )',
                            'RAM ( MIN | MAX )',
                            'Calls'
                        ]));

                        assert(table[1][1] == contractAccount.name);
                        assert(table[3][1] == contractAccount.name);
                        assert(table[4][2] == 'test');

                        return resolve(true);
                    });

                    ResourceReportOption.process(true, { eoslime, testFramework });

                    const contract = await eoslime.Contract.deployOnAccount(FAUCET_WASM_PATH, FAUCET_ABI_PATH, contractAccount);
                    await contract.actions.test();

                    testFramework.eventsHooks[0].callback();
                });

                await waitToPass;
            });
        });
    });

    describe('Command specifics', function () {

        describe('Test utils', function () {

            async function expect (promise, expectCb, message) {
                const testCommand = new TestCommand(class TestFramework {
                    setDescribeArgs () { }
                    runTests () { }
                });

                const args = {};
                const waitToPass = new Promise(async (resolve, reject) => {
                    logger.on('success', async () => {
                        try {
                            await args.eoslime.tests[expectCb](
                                promise,
                                message
                            )
                            resolve(true);
                        } catch (error) {
                            reject(error);
                        }
                    });

                    await testCommand.execute(args);
                });

                await waitToPass;
            }

            describe('expectAssert', function () {

                it('Should expectAssert', async () => {
                    await expect(
                        new Promise((reject, resolve) => {
                            throw new Error('eosio_assert_message_exception');
                        }),
                        'expectAssert'
                    );
                });

                it('Should expectAssert with message', async () => {
                    await expect(
                        new Promise((reject, resolve) => {
                            throw new Error('eosio_assert_message_exception because: this happened');
                        }),
                        'expectAssert',
                        'this happened'
                    );
                });

                it('Should throw in case unexpected error happens', async () => {
                    try {
                        await expect(
                            new Promise((resolve, reject) => {
                                throw new Error('Another error');
                            }),
                            'expectAssert'
                        );
                        assert(false);
                    } catch (error) {
                        assert(error.message.includes('Expected assert, got \'Another error\' instead'));
                    }
                });

                it('Should throw in case of assert with unexpected message happens', async () => {
                    try {
                        await expect(
                            new Promise((resolve, reject) => {
                                throw new Error('eosio_assert_message_exception because: other thing happened');
                            }),
                            'expectAssert',
                            'this happened'
                        );
                        assert(false);
                    } catch (error) {
                        assert(error.message.includes('Expected assert with \'this happened\' message, got \'eosio_assert_message_exception because: other thing happened\' instead'));
                    }
                });

                it('Should throw in case assert error has not been received', async () => {
                    try {
                        await expect(
                            new Promise((resolve, reject) => {
                                resolve(true);
                            }),
                            'expectAssert'
                        );
                        assert(false);
                    } catch (error) {
                        assert(error.message.includes('Expected assert not received'));
                    }
                });
            });

            describe('expectMissingAuthority', function () {
                it('Should expectMissingAuthority', async () => {
                    await expect(
                        new Promise((reject, resolve) => {
                            throw new Error('missing_auth_exception');
                        }),
                        'expectMissingAuthority'
                    );
                });

                it('Should throw in case unexpected error happens', async () => {
                    try {
                        await expect(
                            new Promise((resolve, reject) => {
                                throw new Error('Another error');
                            }),
                            'expectMissingAuthority'
                        );
                        assert(false);
                    } catch (error) {
                        assert(error.message.includes('Expected missing authority, got \'Another error\' instead'));
                    }
                });

                it('Should throw in case missing authority error has not been received', async () => {
                    try {
                        await expect(
                            new Promise((resolve, reject) => {
                                resolve(true);
                            }),
                            'expectMissingAuthority'
                        );
                        assert(false);
                    } catch (error) {
                        assert(error.message.includes('Expected missing authority not received'));
                    }
                });
            });

            describe('expectIrrelevantAuthority', function () {
                it('Should expectIrrelevantAuthority', async () => {
                    await expect(
                        new Promise((reject, resolve) => {
                            throw new Error('irrelevant_auth_exception');
                        }),
                        'expectIrrelevantAuthority'
                    );
                });

                it('Should throw in case unexpected error happens', async () => {
                    try {
                        await expect(
                            new Promise((resolve, reject) => {
                                throw new Error('Another error');
                            }),
                            'expectIrrelevantAuthority'
                        );
                        assert(false);
                    } catch (error) {
                        assert(error.message.includes('Expected irrelevant authority, got \'Another error\' instead'));
                    }
                });

                it('Should throw in case irrelevant authority error has not been received', async () => {
                    try {
                        await expect(
                            new Promise((resolve, reject) => {
                                resolve(true);
                            }),
                            'expectIrrelevantAuthority'
                        );
                        assert(false);
                    } catch (error) {
                        assert(error.message.includes('Expected irrelevant authority not received'));
                    }
                });
            });
        });
    });
});
