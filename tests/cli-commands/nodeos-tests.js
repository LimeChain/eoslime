const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

const Command = require('../../cli-commands/commands/command');
const GroupCommand = require('../../cli-commands/commands/group-command');
const NodeosCommand = require('../../cli-commands/commands/nodeos/index');

// Sub-commands
const LogsCommand = require('../../cli-commands/commands/nodeos/subcommands/logs/index');
const StopCommand = require('../../cli-commands/commands/nodeos/subcommands/stop/index');
const StartCommand = require('../../cli-commands/commands/nodeos/subcommands/start/index');
const AccountsCommand = require('../../cli-commands/commands/nodeos/subcommands/accounts/index');

// Definitions
const logsDefinition = require('../../cli-commands/commands/nodeos/subcommands/logs/definition');
const stopDefinition = require('../../cli-commands/commands/nodeos/subcommands/stop/definition');
const startDefinition = require('../../cli-commands/commands/nodeos/subcommands/start/definition');
const nodeosDefinition = require('../../cli-commands/commands/nodeos/definition');
const accountsDefinition = require('../../cli-commands/commands/nodeos/subcommands/accounts/definition');

// Options
const PathOption = require('../../cli-commands/commands/nodeos/subcommands/start/options/path-option');
const LinesOption = require('../../cli-commands/commands/nodeos/subcommands/logs/options/lines-option');

// Common & Specifics
const dataManager = require('../../cli-commands/commands/nodeos/specific/nodeos-data/data-manager');
const predefinedAccounts = require('../../cli-commands/commands/nodeos/subcommands/common/accounts');

const Logger = require('./utils/logger');
const logger = new Logger();

describe('Nodeos Command', function () {

    beforeEach(async () => {
        logger.hide(sinon);
    });

    afterEach(async () => {
        sinon.restore();
    });

    describe('Command', function () {

        it('Should initialize command properly', async () => {
            let nodeosCommand = new NodeosCommand();

            assert(nodeosCommand instanceof GroupCommand);
            assert(nodeosCommand.template == nodeosDefinition.template);
            assert(nodeosCommand.description = nodeosDefinition.description);
            assert(nodeosCommand.options == nodeosDefinition.options);
            assert(nodeosCommand.subcommands.length > 0);
        });
    });

    describe('Sub-commands', function () {

        function stubNodeosDataManager (nodeosRunning, checkPoints) {
            return {
                '../../specific/nodeos-data/data-manager': {
                    nodeosIsRunning: () => { return nodeosRunning; },
                    nodeosPath: () => { return ''; },
                    setNodeosPath: (path) => { checkPoints.setNodeosPath--; },
                    requireRunningNodeos: () => { checkPoints.requireRunningNodeos--; }
                }
            }
        }

        function stubAsyncSoftExec (checkPoints) {
            return {
                '../../../../helpers/async-soft-exec': class FakeAsyncSoftExec {
                    constructor () { }
                    exec () { checkPoints.exec--; }
                }
            }
        }

        describe('Start Command', function () {
            let startCommand;

            beforeEach(async () => {
                startCommand = new StartCommand();
            });

            it('Should initialize command properly', async () => {
                assert(startCommand instanceof Command);
                assert(startCommand.template == startDefinition.template);
                assert(startCommand.description = startDefinition.description);
                assert(startCommand.options == startDefinition.options);
                assert(startCommand.subcommands.length == 0);
            });

            function stubPredefinedAccounts (checkPoints) {
                return {
                    '../common/accounts': {
                        load: () => { checkPoints.load--; }
                    }
                }
            }

            it('Should log in case another nodeos instance has been run already', async () => {
                const startCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/start/index', {
                    ...stubNodeosDataManager(true)
                }));

                const waitToPass = new Promise(async (resolve, reject) => {
                    logger.on('info', (message) => {
                        if (message.includes('Nodeos is already running')) {
                            return resolve(true);
                        }
                    });

                    await startCommand.execute();
                });

                await waitToPass;
            });

            it('Should start nodeos', async () => {
                const checkPoints = {
                    setNodeosPath: 1,
                    requireRunningNodeos: 1,
                    load: 1,
                    exec: 1
                }

                const startCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/start/index', {
                    ...stubNodeosDataManager(false, checkPoints),
                    ...stubAsyncSoftExec(checkPoints),
                    ...stubPredefinedAccounts(checkPoints)
                }));

                await startCommand.execute({ path: './' });

                assert(checkPoints.setNodeosPath == 0);
                assert(checkPoints.requireRunningNodeos == 0);
                assert(checkPoints.load == 0);
                assert(checkPoints.exec == 0);
            });

            it('Should log in case of an error', async () => {
                const startCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/start/index', {
                    '../../command': class FakeCommand {
                        processOptions () { throw new Error('Fake error') }
                    },
                    ...stubNodeosDataManager(false)
                }));

                const waitToPass = new Promise(async (resolve, reject) => {
                    logger.on('error', (message) => {
                        if (message.includes('Nodeos has not been started')) {
                            return resolve(true);
                        }
                    });

                    await startCommand.execute();
                });

                await waitToPass;
            });

            describe('Options', function () {
                describe('Path', function () {
                    it('Should return provided path', async () => {
                        const path = await PathOption.process('./');
                        assert(path == './');
                    });

                    it('Should throw in case the provided path is an incorrect one', async () => {
                        try {
                            await PathOption.process('./custom');
                            assert(false);
                        } catch (error) {
                            assert(error.message.includes('no such file or directory, lstat \'./custom\''));
                        }
                    });
                });
            });
        });

        describe('Stop Command', function () {
            let stopCommand;

            beforeEach(async () => {
                stopCommand = new StopCommand();
            });

            function stubFileSystemUtils (checkPoints) {
                return {
                    '../../../../helpers/file-system-util': {
                        rmFile: (dirPath) => { checkPoints.rmFile--; },
                        recursivelyDeleteDir: () => { checkPoints.recursivelyDeleteDir--; },
                        readFile: () => { checkPoints.readFile--; }
                    }
                }
            }

            it('Should initialize command properly', async () => {
                assert(stopCommand instanceof Command);
                assert(stopCommand.template == stopDefinition.template);
                assert(stopCommand.description = stopDefinition.description);
                assert(stopCommand.options == stopDefinition.options);
                assert(stopCommand.subcommands.length == 0);
            });

            it('Should stop nodeos instance', async () => {
                const checkPoints = {
                    exec: 1,
                    rmFile: 2,
                    readFile: 1,
                    recursivelyDeleteDir: 2
                }

                const dataManager = stubNodeosDataManager(true);
                const asyncSoftExec = stubAsyncSoftExec(checkPoints);
                const fileSystemUtils = stubFileSystemUtils(checkPoints);

                const stopCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/stop/index', {
                    ...dataManager,
                    ...fileSystemUtils,
                    ...asyncSoftExec
                }));

                await stopCommand.execute();
                assert(checkPoints.exec == 0);
                assert(checkPoints.rmFile == 0);
                assert(checkPoints.readFile == 0);
                assert(checkPoints.recursivelyDeleteDir == 0);
            });

            it('Should clear only nodeos data in case of no running nodeos instance', async () => {
                const checkPoints = {
                    exec: 1,
                    rmFile: 2,
                    readFile: 1,
                    recursivelyDeleteDir: 2
                }

                const dataManager = stubNodeosDataManager(false);
                const asyncSoftExec = stubAsyncSoftExec(checkPoints);
                const fileSystemUtils = stubFileSystemUtils(checkPoints);

                const stopCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/stop/index', {
                    ...dataManager,
                    ...fileSystemUtils,
                    ...asyncSoftExec
                }));

                await stopCommand.execute();
                assert(checkPoints.exec == 1);
                assert(checkPoints.rmFile == 0);
                assert(checkPoints.readFile == 1);
                assert(checkPoints.recursivelyDeleteDir == 0);
            });

            it('Should log in case of an error', async () => {
                const stopCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/stop/index', {
                    '../../specific/nodeos-data/data-manager': {
                        nodeosIsRunning: () => { throw new Error(); },
                        nodeosPath: () => { return ''; }
                    }
                }));

                const waitToPass = new Promise(async (resolve, reject) => {
                    logger.on('error', (message) => {
                        if (message.includes('Nodeos has not been stopped')) {
                            return resolve(true);
                        }
                    });


                    await stopCommand.execute();
                });

                await waitToPass;
            });
        });

        describe('Logs Command', function () {
            let logsCommand;

            beforeEach(async () => {
                logsCommand = new LogsCommand();
            });

            it('Should initialize command properly', async () => {
                assert(logsCommand instanceof Command);
                assert(logsCommand.template == logsDefinition.template);
                assert(logsCommand.description = logsDefinition.description);
                assert(logsCommand.options == logsDefinition.options);
                assert(logsCommand.subcommands.length == 0);
            });

            it('Should log in case of no running nodeos instance', async () => {
                const dataManager = stubNodeosDataManager(false);

                const logsCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/logs/index', {
                    ...dataManager
                }));

                const waitToPass = new Promise(async (resolve, reject) => {
                    logger.on('info', (message) => {
                        if (message.includes('Empty logs')) {
                            return resolve(true);
                        }
                    });

                    await logsCommand.execute();
                });

                await waitToPass;
            });

            it('Should display nodeos logs', async () => {
                const checkPoints = {
                    exec: 1
                }

                const dataManager = stubNodeosDataManager(true);
                const asyncSoftExec = stubAsyncSoftExec(checkPoints);

                const logsCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/logs/index', {
                    ...dataManager,
                    ...asyncSoftExec
                }));

                const waitToPass = new Promise(async (resolve, reject) => {
                    logger.on('success', (message) => {
                        if (message.includes('Nodeos logs')) {
                            return resolve(true);
                        }
                    });

                    await logsCommand.execute({ lines: 1 });
                });

                await waitToPass;
                assert(checkPoints.exec == 0);
            });

            it('Should log in case of an error', async () => {
                const logsCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/logs/index', {
                    '../../../command': class FakeCommand {
                        processOptions () {
                            throw new Error();
                        }
                    },
                    ...stubNodeosDataManager(true)
                }));

                const waitToPass = new Promise(async (resolve, reject) => {
                    logger.on('error', (message) => {
                        if (message.includes('Logs has not been shown')) {
                            return resolve(true);
                        }
                    });

                    await logsCommand.execute({ lines: 1 });
                });

                await waitToPass;
            });

            describe('Options', function () {
                describe('Number of lines', function () {
                    it('Should return provided number of lines', async () => {
                        assert(LinesOption.process(1) == 1);
                        assert(LinesOption.definition.default == 10);
                    });
                });
            });
        });

        describe('Accounts Command', function () {
            let accountsCommand;

            beforeEach(async () => {
                accountsCommand = new AccountsCommand();
            });

            it('Should initialize command properly', async () => {
                assert(accountsCommand instanceof Command);
                assert(accountsCommand.template == accountsDefinition.template);
                assert(accountsCommand.description = accountsDefinition.description);
                assert(accountsCommand.options == accountsDefinition.options);
                assert(accountsCommand.subcommands.length == 0);
            });

            it('Should display a table with preloaded accounts', async () => {
                const waitToPass = new Promise(async (resolve, reject) => {
                    logger.on('log', (message) => {
                        for (let i = 0; i < predefinedAccounts.length; i++) {
                            assert(message.includes(predefinedAccounts[i].name));
                            assert(message.includes(predefinedAccounts[i].publicKey));
                            assert(message.includes(predefinedAccounts[i].privateKey));
                        }

                        return resolve(true);
                    });

                    await accountsCommand.execute();
                });

                await waitToPass;
            });

            it('Should log in case of an error', async () => {
                const accountsCommand = new (proxyquire('../../cli-commands/commands/nodeos/subcommands/accounts/index', {
                    '../common/accounts': {
                        accounts () {
                            throw new Error();
                        }
                    }
                }));

                const waitToPass = new Promise(async (resolve, reject) => {
                    logger.on('error', (message) => {
                        if (message.includes('Accounts has not been shown')) {
                            return resolve(true);
                        }
                    });

                    await accountsCommand.execute();
                });

                await waitToPass;
            });

        });
    });

    describe('Command specifics', function () {

        describe('Data Manager', function () {

            function stubFileSystemUtilsCallback (cb) {
                return proxyquire('../../cli-commands/commands/nodeos/specific/nodeos-data/data-manager', {
                    '../../../../helpers/file-system-util': {
                        writeFile: (path, content) => { return cb(path, content) },
                        readFile: (filePath) => { return cb(filePath) }
                    }
                });
            }

            it('Should return dirname as default path', async () => {
                assert(dataManager.defaultPath().includes('eoslime/cli-commands/commands/nodeos/specific/nodeos-data'));
            });

            it('Should return the last set nodeosPath', async () => {
                assert(dataManager.nodeosPath());
            });

            it('Should set new nodeos path', async () => {
                const dataManagerStub = stubFileSystemUtilsCallback((path, content) => {
                    assert(path.includes('eoslime/cli-commands/commands/nodeos/specific/nodeos-data/nodeos.json'));
                    assert(content == '{"nodeosPath":"./custom"}');
                });

                dataManagerStub.setNodeosPath('./custom');
            });

            it('Should return if nodeos is running', async () => {
                const dataManagerStub = stubFileSystemUtilsCallback((path) => {
                    assert('./custom/eosd.pid' == path);
                    return { toString: () => { return 'content'; } }
                });

                dataManagerStub.nodeosIsRunning('./custom');
            });

            it('Should throw in case nodeos is not running', async () => {
                try {
                    dataManager.nodeosIsRunning = () => { return false; }
                    dataManager.requireRunningNodeos('./custom');

                    assert(false);
                } catch (error) {
                    assert(error.message === 'Check if another nodeos has been started already');
                }
            });
        });

        describe('Pre-defined accounts', function () {

            it('Should return pre-defined accounts', async () => {
                const accounts = predefinedAccounts.accounts();

                assert(accounts.length == 3);

                assert(accounts[0].name == 'eoslimedavid');
                assert(accounts[0].publicKey == 'EOS7UyV15G2t47MqRm4WpUP6KTfy9sNU3HHGu9aAgR2A3ktxoBTLv');
                assert(accounts[0].privateKey == '5KS9t8LGsaQZxLP6Ln5WK6XwYU8M3AYHcfx1x6zoGmbs34vQsPT');

                assert(accounts[1].name == 'eoslimekevin');
                assert(accounts[1].publicKey == 'EOS6Zz4iPbjm6FNys1zUMaRE4zPXrHcX3SRG65YWneVbdXQTSiqDp');
                assert(accounts[1].privateKey == '5KieRy975NgHk5XQfn8r6o3pcqJDF2vpeV9bDiuB5uF4xKCTwRF');

                assert(accounts[2].name == 'eoslimemarty');
                assert(accounts[2].publicKey == 'EOS7FDeYdY3G8yMNxtrU8MSYnAJc3ZogYHgL7RG3rBf8ZDYA3xthi');
                assert(accounts[2].privateKey == '5JtbCXgK5NERDdFdrmxb8rpYMkoxVfSyH1sR6TYxHBG5zNLHfj5');
            });

            it('Should create pre-defined accounts on the chain', async () => {
                let numberOfCreations = 3;

                // Stub eoslime
                const accounts = proxyquire('../../cli-commands/commands/nodeos/subcommands/common/accounts', {
                    '../../../../../': {
                        init: () => {
                            return {
                                Account: {
                                    create: () => { numberOfCreations--; }
                                }
                            }
                        }
                    }
                });

                await accounts.load();
                assert(numberOfCreations == 0);
            });
        });
    });
});
