const path = require('path');
const fs = require('fs-extra');
const sinon = require('sinon');
const assert = require('assert');

const Command = require('../../cli-commands/commands/command');
const GroupCommand = require('../../cli-commands/commands/group-command');
const NodeosCommand = require('../../cli-commands/commands/nodeos/index');
const AsyncSoftExec = require('../../cli-commands/helpers/async-soft-exec');
const AccountFactory = require('../../src/account/normal-account/account-factory');
const LogsCommand = require('../../cli-commands/commands/nodeos/subcommands/logs/index');
const StopCommand = require('../../cli-commands/commands/nodeos/subcommands/stop/index');
const StartCommand = require('../../cli-commands/commands/nodeos/subcommands/start/index');
const AccountsCommand = require('../../cli-commands/commands/nodeos/subcommands/accounts/index');
const AccountsTable = require('../../cli-commands/commands/nodeos/subcommands/accounts/specific/accounts-table');

const nodeosDefinition = require('../../cli-commands/commands/nodeos/definition');
const logsDefinition = require('../../cli-commands/commands/nodeos/subcommands/logs/definition');
const stopDefinition = require('../../cli-commands/commands/nodeos/subcommands/stop/definition');
const startDefinition = require('../../cli-commands/commands/nodeos/subcommands/start/definition');
const accountsDefinition = require('../../cli-commands/commands/nodeos/subcommands/accounts/definition');
const PathOption = require('../../cli-commands/commands/nodeos/subcommands/start/options/path-option');
const LinesOption = require('../../cli-commands/commands/nodeos/subcommands/logs/options/lines-option');

const fileSystemUtil = require('../../cli-commands/helpers/file-system-util');
const template = require('../../cli-commands/commands/nodeos/subcommands/start/specific/template');
const predefinedAccounts = require('../../cli-commands/commands/nodeos/subcommands/common/accounts');
const nodoesDataManager = require('../../cli-commands/commands/nodeos/specific/nodeos-data/data-manager');

describe('NodeosCommand', function () {
    const TEST_DIR = './cli-commands-test';
    const NODEOS_DATA_DIR = 'nodeos-data';

    let initialDir;
    let nodeosDataPath;

    before(async () => {
        initialDir = process.cwd();
        fs.mkdirSync(TEST_DIR);
        process.chdir(TEST_DIR);
        nodeosDataPath = path.resolve(process.cwd(), NODEOS_DATA_DIR);
        fs.mkdirSync('./nodeos-data');
    });

    afterEach(async () => {
        sinon.restore();
        cleanNodeosDataFolder();
    });

    after(async () => {
        process.chdir(initialDir);
        fs.removeSync(TEST_DIR);
    });

    function preloadNodeosData () {
        fs.mkdir('./nodeos-data/data');
        fs.mkdir('./nodeos-data/config');
        fs.copyFileSync('../tests/cli-commands/mocks/nodeos-data/eosd.pid', './nodeos-data/eosd.pid');
        fs.copyFileSync('../tests/cli-commands/mocks/nodeos-data/nodeos.log', './nodeos-data/nodeos.log');
    }

    function cleanNodeosDataFolder () {
        fs.removeSync('./nodeos-data/data');
        fs.removeSync('./nodeos-data/config');
        fs.removeSync('./nodeos-data/eosd.pid');
        fs.removeSync('./nodeos-data/nodeos.log');
    }

    it('Should initialize command properly', async () => {
        let nodeosCommand = new NodeosCommand();

        assert(nodeosCommand instanceof GroupCommand);
        assert(nodeosCommand.template == nodeosDefinition.template);
        assert(nodeosCommand.description = nodeosDefinition.description);
        assert(nodeosCommand.options == nodeosDefinition.options);
        assert(nodeosCommand.subcommands.length > 0);
    });

    describe('StartCommand', function () {
        let startCommand;
        let templateSpy;
        let pathOptionSpy;
        let setNodeosPathSpy;
        let predefinedAccountsSpy;

        beforeEach(async () => {
            startCommand = new StartCommand();

            sinon.stub(fileSystemUtil, "writeFile");
            sinon.stub(AsyncSoftExec.prototype, "exec");
            sinon.stub(AccountFactory.prototype, "create");
            sinon.stub(nodoesDataManager, "defaultPath").returns(nodeosDataPath);

            templateSpy = sinon.spy(template, "build");
            pathOptionSpy = sinon.spy(PathOption, "process");
            predefinedAccountsSpy = sinon.spy(predefinedAccounts, "load");
            setNodeosPathSpy = sinon.spy(nodoesDataManager, "setNodeosPath");
        });

        it('Should initialize command properly', async () => {
            assert(startCommand instanceof Command);
            assert(startCommand.template == startDefinition.template);
            assert(startCommand.description = startDefinition.description);
            assert(startCommand.options == startDefinition.options);
            assert(startCommand.subcommands.length == 0);
        });

        it('Should break when there is already running nodeos', async () => {
            sinon.stub(nodoesDataManager, "nodeosIsRunning").returns(true);

            assert(await startCommand.execute({ path: nodeosDataPath }));

            sinon.assert.notCalled(pathOptionSpy);
            sinon.assert.notCalled(setNodeosPathSpy);
        });

        it('Should start nodeos successfully', async () => {
            let stub = sinon.stub(nodoesDataManager, "nodeosIsRunning");
            stub.onFirstCall().returns(false);
            stub.onSecondCall().returns(true);

            assert(await startCommand.execute({ path: nodeosDataPath }));

            sinon.assert.calledWith(pathOptionSpy, nodeosDataPath);
            sinon.assert.calledWith(setNodeosPathSpy, nodeosDataPath);
            sinon.assert.calledWith(templateSpy, nodeosDataPath);
            sinon.assert.calledOnce(predefinedAccountsSpy);
        });

        it('Should throw when unexpected error occurred', async () => {
            let stub = sinon.stub(nodoesDataManager, "nodeosIsRunning");
            stub.onFirstCall().returns(false);
            stub.onSecondCall().returns(false);

            assert(await startCommand.execute({ path: nodeosDataPath }));

            sinon.assert.calledWith(pathOptionSpy, nodeosDataPath);
            sinon.assert.calledWith(setNodeosPathSpy, nodeosDataPath);
            sinon.assert.calledWith(templateSpy, nodeosDataPath);
            sinon.assert.notCalled(predefinedAccountsSpy);
        });

    });

    describe('StopCommand', function () {
        let stopCommand;
        let fsReadFileSpy;
        let fsRemoveDirSpy;
        let fsRemoveFileSpy;

        beforeEach(async () => {
            stopCommand = new StopCommand();
            sinon.stub(AsyncSoftExec.prototype, "exec");
            sinon.stub(nodoesDataManager, "nodeosPath").returns(nodeosDataPath);
            fsReadFileSpy = sinon.spy(fileSystemUtil, "readFile");
            fsRemoveFileSpy = sinon.spy(fileSystemUtil, "rmFile");
            fsRemoveDirSpy = sinon.spy(fileSystemUtil, "recursivelyDeleteDir");
        });

        it('Should initialize command properly', async () => {
            assert(stopCommand instanceof Command);
            assert(stopCommand.template == stopDefinition.template);
            assert(stopCommand.description = stopDefinition.description);
            assert(stopCommand.options == stopDefinition.options);
            assert(stopCommand.subcommands.length == 0);
        });

        it('Should clean only the data when there is no running nodeos', async () => {
            preloadNodeosData();

            sinon.stub(nodoesDataManager, "nodeosIsRunning").returns(false);

            assert(await stopCommand.execute());

            sinon.assert.notCalled(fsReadFileSpy);
            sinon.assert.calledTwice(fsRemoveFileSpy);
            sinon.assert.calledTwice(fsRemoveDirSpy);
        });

        it('Should stop nodeos and clean the data', async () => {
            preloadNodeosData();

            sinon.stub(nodoesDataManager, "nodeosIsRunning").returns(true);

            assert(await stopCommand.execute());

            sinon.assert.calledWith(fsReadFileSpy, nodeosDataPath + '/eosd.pid');
            sinon.assert.calledTwice(fsRemoveFileSpy);
            fsRemoveFileSpy.firstCall.calledWith(nodeosDataPath + '/eosd.pid');
            fsRemoveFileSpy.firstCall.calledWith(nodeosDataPath + '/nodeos.log');
            sinon.assert.calledTwice(fsRemoveDirSpy);
            fsRemoveDirSpy.firstCall.calledWith(nodeosDataPath + '/data');
            fsRemoveDirSpy.firstCall.calledWith(nodeosDataPath + '/config');
        });

        it('Should throw when unexpected error occured', async () => {
            preloadNodeosData();

            sinon.stub(nodoesDataManager, "nodeosIsRunning").throws();

            assert(await stopCommand.execute());

            sinon.assert.notCalled(fsRemoveFileSpy);
            sinon.assert.notCalled(fsRemoveDirSpy);
        });

    });

    describe('LogsCommand', function () {
        let logsCommand;
        let linesOptionSpy;

        beforeEach(async () => {
            logsCommand = new LogsCommand();
            sinon.stub(AsyncSoftExec.prototype, "exec");
            sinon.stub(nodoesDataManager, "nodeosPath").returns(nodeosDataPath);
            linesOptionSpy = sinon.spy(LinesOption, "process");
        });

        it('Should initialize command properly', async () => {
            assert(logsCommand instanceof Command);
            assert(logsCommand.template == logsDefinition.template);
            assert(logsCommand.description = logsDefinition.description);
            assert(logsCommand.options == logsDefinition.options);
            assert(logsCommand.subcommands.length == 0);
        });

        it('Should break when there is no running nodeos', async () => {
            preloadNodeosData();

            sinon.stub(nodoesDataManager, "nodeosIsRunning").returns(false);
            let processOptionsSpy = sinon.spy(Command.prototype, "processOptions");

            assert(await logsCommand.execute({ lines: 10 }));

            sinon.assert.notCalled(processOptionsSpy);
        });

        it('Should display nodeos logs successfully', async () => {
            preloadNodeosData();

            sinon.stub(nodoesDataManager, "nodeosIsRunning").returns(true);

            assert(await logsCommand.execute({ lines: 10 }));

            sinon.assert.calledWith(linesOptionSpy, 10);
        });

        it('Should throw when processing command options failed', async () => {
            preloadNodeosData();

            sinon.stub(nodoesDataManager, "nodeosIsRunning").returns(true);
            sinon.stub(Command.prototype, "processOptions").throws('Test: Process Options Failure');

            assert(await logsCommand.execute({ lines: 10 }));

            sinon.assert.notCalled(linesOptionSpy);
        });

    });

    describe('AccountsCommand', function () {
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

        it('Should display preloaded accounts', async () => {
            let addTableRowSpy = sinon.spy(AccountsTable.prototype, "addRow");
            let drawTableSpy = sinon.spy(AccountsTable.prototype, "draw");

            assert(await accountsCommand.execute());

            const accounts = predefinedAccounts.accounts();

            sinon.assert.calledThrice(addTableRowSpy);
            addTableRowSpy.firstCall.calledWith(accounts[0].name, accounts[0].publicKey, accounts[0].privateKey);
            addTableRowSpy.firstCall.calledWith(accounts[1].name, accounts[1].publicKey, accounts[1].privateKey);
            addTableRowSpy.firstCall.calledWith(accounts[2].name, accounts[2].publicKey, accounts[2].privateKey);
            sinon.assert.calledOnce(drawTableSpy);
        });

        it('Should throw when table drawing failed', async () => {
            sinon.stub(AccountsTable.prototype, "draw").throws();

            assert(await accountsCommand.execute());
        });

    });

    describe('DataManager', function () {

        describe('nodeosIsRunning', function () {

            it('Should return false when eosd.pid file does not exists', async () => {
                assert(!nodoesDataManager.nodeosIsRunning(nodeosDataPath));
            });
    
            it('Should return false when eosd.pid file exists, but nodeos is not running', async () => {
                preloadNodeosData();
    
                sinon.stub(process, "kill").throws();
    
                assert(!nodoesDataManager.nodeosIsRunning(nodeosDataPath));
            });

            it('Should return true when eosd.pid file exists and nodeos is running', async () => {
                preloadNodeosData();
    
                sinon.stub(process, "kill").returns(true);
    
                assert(nodoesDataManager.nodeosIsRunning(nodeosDataPath));
            });

        });

    })

});