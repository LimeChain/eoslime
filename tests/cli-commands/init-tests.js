const fs = require('fs-extra');
const sinon = require('sinon');
const assert = require('assert');

const logger = require('../../cli-commands/common/logger');
const Command = require('../../cli-commands/commands/command');
const InitCommand = require('../../cli-commands/commands/init/index');
const AsyncSoftExec = require('../../cli-commands/helpers/async-soft-exec');
const definition = require('../../cli-commands/commands/init/definition');
const fileSystemUtil = require('../../cli-commands/helpers/file-system-util');
const directories = require('../../cli-commands/commands/init/specific/directories.json');
const WithExampleOption = require('../../cli-commands/commands/init/options/with-example/with-example-option');

describe('InitCommand', function () {
    const TEST_DIR = "./cli-commands-test";
    const WITH_EXAMPLE = { 'with-example': true };
    const WITHOUT_EXAMPLE = { 'with-example': false };

    let initialDir;
    let initCommand;
    let exampleOptionSpy;
    let fileSystemUtilSpy;

    before(async () => {
        initialDir = process.cwd();
        fs.mkdirSync(TEST_DIR);
        process.chdir(TEST_DIR);
    });

    beforeEach(async () => {
        initCommand = new InitCommand();
        sinon.stub(logger, "info");
        sinon.stub(logger, "error");
        sinon.stub(AsyncSoftExec.prototype, "exec");
        exampleOptionSpy = sinon.spy(WithExampleOption, "process");
        fileSystemUtilSpy = sinon.spy(fileSystemUtil, "copyAllFilesFromDirTo");
    });

    afterEach(async () => {
        sinon.restore();
        cleanDirectories();
    });

    after(async () => {
        process.chdir(initialDir);
        fs.removeSync(TEST_DIR);
    });

    function checkDirectories() {
        assert(fs.existsSync(directories.DEPLOYMENT));
        assert(fs.existsSync(directories.CONTRACTS));
        assert(fs.existsSync(directories.TESTS));
        assert(fs.existsSync(directories.PACKAGE_JSON));
    }

    function checkExampleFiles () {
        assert(fs.existsSync(`${directories.DEPLOYMENT}/example-deploy.js`));
        assert(fs.existsSync(`${directories.CONTRACTS}/example`));
        assert(fs.existsSync(`${directories.TESTS}/example-tests.js`));
    }

    function cleanDirectories () {
        fs.removeSync(directories.DEPLOYMENT);
        fs.removeSync(directories.CONTRACTS);
        fs.removeSync(directories.TESTS);
        fs.removeSync(directories.PACKAGE_JSON);
    }

    it('Should initialize command properly', async () => {
        assert(initCommand instanceof Command);
        assert(initCommand.template == definition.template);
        assert(initCommand.description = definition.description);
        assert(initCommand.options == definition.options);
        assert(initCommand.subcommands.length == 0);
    });

    it('Should init project structure', async () => {
        assert(await initCommand.execute({}));

        sinon.assert.notCalled(exampleOptionSpy);
        checkDirectories();
    });

    it('Should init project structure [with-example = false]', async () => {
        assert(await initCommand.execute(WITHOUT_EXAMPLE));

        sinon.assert.calledWith(exampleOptionSpy, false);
        sinon.assert.notCalled(fileSystemUtilSpy);
        checkDirectories();
    });

    it('Should init project structure and provide example files', async () => {
        assert(await initCommand.execute(WITH_EXAMPLE));

        sinon.assert.calledWith(exampleOptionSpy, true);
        checkDirectories();
        checkExampleFiles();
    });

});