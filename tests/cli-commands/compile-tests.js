const fs = require('fs-extra');
const sinon = require('sinon');
const assert = require('assert');

const Command = require('../../cli-commands/commands/command');
const CompileCommand = require('../../cli-commands/commands/compile/index');
const AsyncSoftExec = require('../../cli-commands/helpers/async-soft-exec');
const fileSysUtils = require('../../cli-commands/helpers/file-system-util');
const definition = require('../../cli-commands/commands/compile/definition');
const commandMessages = require('../../cli-commands/commands/compile/messages');
const PathOption = require('../../cli-commands/commands/compile/options/path-option');
const directories = require('../../cli-commands/commands/compile/specific/directories.json');
const logger = require('../../cli-commands/common/logger');

describe('CompileCommand', function () {
    const TEST_DIR = './cli-commands-test';
    const DEFAULT_PATH = './contracts';
    const INVALID_PATH = './unknown_folder';
    const INVALID_FILE = 'file.txt';

    let initialDir;
    let compileCommand;
    let pathOptionSpy;
    let fsCreateDirSpy;

    before(async () => {
        initialDir = process.cwd();
        fs.mkdirSync(TEST_DIR);
        process.chdir(TEST_DIR);
    });

    beforeEach(async () => {
        compileCommand = new CompileCommand();
        sinon.stub(logger, "info");
        sinon.stub(logger, "error");
        pathOptionSpy = sinon.spy(PathOption, "process");
        fsCreateDirSpy = sinon.spy(fileSysUtils, "createDir");
    });

    afterEach(async () => {
        sinon.restore();
        cleanDirectories();
    });

    after(async () => {
        process.chdir(initialDir);
        fs.removeSync(TEST_DIR);
    });

    function cleanDirectories () {
        fs.removeSync('./contracts');
        fs.removeSync('./compiled');
    }

    function createContractsFolder () {
        fs.mkdirSync('./contracts');
    }

    function preloadContracts() {
        fs.copyFileSync('../tests/testing-contracts/eosio.token.cpp', './contracts/eosio.token.cpp');
        fs.copyFileSync('../tests/testing-contracts/eosio.token.hpp', './contracts/eosio.token.hpp');
    }

    it('Should initialize command properly', async () => {
        assert(compileCommand instanceof Command);
        assert(compileCommand.template == definition.template);
        assert(compileCommand.description = definition.description);
        assert(compileCommand.options == definition.options);
        assert(compileCommand.subcommands.length == 0);
    });

    it('Should compile when valid contracts folder is specified', async () => {
        sinon.stub(AsyncSoftExec.prototype, "exec").callsFake(() => {
            commandMessages.SuccessfulCompilationOfContract();
        });

        createContractsFolder();
        preloadContracts();

        assert(await compileCommand.execute({ path: DEFAULT_PATH }));

        sinon.assert.calledWith(pathOptionSpy, DEFAULT_PATH);
        sinon.assert.calledOnceWithExactly(fsCreateDirSpy, directories.COMPILED);

        let result = await pathOptionSpy.returnValues[0];
        assert(result[0].fullPath == `${DEFAULT_PATH}/eosio.token.cpp`);
        assert(result[0].fileName == 'eosio.token');
    });

    it('Should throw when invalid contracts folder is specified', async () => {
        assert(await compileCommand.execute({ path: INVALID_PATH }));

        sinon.assert.calledWith(pathOptionSpy, INVALID_PATH);
        sinon.assert.notCalled(fsCreateDirSpy);
    });

    it('Should throw when specified contracts folder is empty', async () => {
        createContractsFolder();

        assert(await compileCommand.execute({ path: DEFAULT_PATH }));

        sinon.assert.calledWith(pathOptionSpy, DEFAULT_PATH);
        sinon.assert.notCalled(fsCreateDirSpy);
    });

    it('Should compile when valid contract path is specified', async () => {
        sinon.stub(AsyncSoftExec.prototype, "exec").callsFake(() => {
            commandMessages.UnsuccessfulCompilationOfContract();
        });

        createContractsFolder();
        preloadContracts();
        
        assert(await compileCommand.execute({ path: `${DEFAULT_PATH}/eosio.token.cpp` }));

        sinon.assert.calledWith(pathOptionSpy, `${DEFAULT_PATH}/eosio.token.cpp`);
        sinon.assert.calledOnceWithExactly(fsCreateDirSpy, directories.COMPILED);

        let result = await pathOptionSpy.returnValues[0];
        assert(result[0].fullPath == `${DEFAULT_PATH}/eosio.token.cpp`);
        assert(result[0].fileName == 'eosio.token');
    });

    it('Should throw when invalid contract path is specified', async () => {
        assert(await compileCommand.execute({ path: `${INVALID_PATH}/eosio.token.cpp` }));

        sinon.assert.calledWith(pathOptionSpy, `${INVALID_PATH}/eosio.token.cpp`);
        sinon.assert.notCalled(fsCreateDirSpy);
    });

    it('Should throw when invalid contract name is specified', async () => {
        fs.createFileSync(INVALID_FILE);

        assert(await compileCommand.execute({ path: `./${INVALID_FILE}` }));

        sinon.assert.calledWith(pathOptionSpy, `./${INVALID_FILE}`);
        sinon.assert.notCalled(fsCreateDirSpy);
    });

});