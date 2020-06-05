const fs = require('fs-extra');
const sinon = require('sinon');
const assert = require('assert');
const eoslime = require('../../index');

const Command = require('../../cli-commands/commands/command');
const TestCommand = require('../../cli-commands/commands/test/index');
const ProviderFactory = require('../../src/network-providers/provider-factory');
const MochaFramework = require('../../cli-commands/commands/test/specific/test-frameworks/mocha');
const ReportTable = require('../../cli-commands/commands/test/options/resource-usage-option/report-table');

const definition = require('../../cli-commands/commands/test/definition');
const PathOption = require('../../cli-commands/commands/test/options/path-option');
const NetworkOption = require('../../cli-commands/commands/test/options/network-option');
const ResourceReportOption = require('../../cli-commands/commands/test/options/resource-usage-option/resource-usage-option');

describe('TestCommand', function () {
    const TEST_DIR = './cli-commands-test';
    const DEFAULT_PATH = './tests';
    const INVALID_PATH = './unknown_folder';
    const DEFAULT_NETWORK = 'local';
    const INVALID_NETWORK = 'invalid_network';
    const CUSTOM_NETWORK = { url: "https://test.custom.net", chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f" };

    let initialDir;
    let testCommand;
    let eoslimeSpy;
    let pathOptionSpy;
    let networkOptionSpy;
    let resourceReportOptionSpy;
    let mochaAddTestFilesSpy;
    let mochaSetDescribeArgs;
    let mochaRunTestsSpy;
    let providerFactorySpy;
    let reportTableSpy;

    before(async () => {
        initialDir = process.cwd();
        fs.mkdirSync(TEST_DIR);
        process.chdir(TEST_DIR);
    });

    beforeEach(async () => {
        eoslimeSpy = sinon.spy(eoslime, "init");
        testCommand = new TestCommand(MochaFramework);
        pathOptionSpy = sinon.spy(PathOption, "process");
        networkOptionSpy = sinon.spy(NetworkOption, "process");
        resourceReportOptionSpy = sinon.spy(ResourceReportOption, "process");
        mochaAddTestFilesSpy = sinon.spy(MochaFramework.prototype, "addTestFiles");
        mochaSetDescribeArgs = sinon.spy(MochaFramework.prototype, "setDescribeArgs");
        mochaRunTestsSpy = sinon.spy(MochaFramework.prototype, "runTests");
        providerFactorySpy = sinon.spy(ProviderFactory.prototype, "reset");
        reportTableSpy = sinon.spy(ReportTable.prototype, "draw");
        
        preloadMockedTests();
    });

    afterEach(async () => {
        sinon.restore();
        fs.removeSync('./tests');
    });
    
    after(async () => {
        process.chdir(initialDir);
        fs.removeSync(TEST_DIR);
    });

    function preloadMockedTests () {
        fs.mkdirSync('./tests');
        fs.copyFileSync('../tests/cli-commands/mocks/tests-mock.js', './tests/tests-mock.js');
    }

    it('Should initialize command properly', async () => {
        assert(testCommand instanceof Command);
        assert(testCommand.template == definition.template);
        assert(testCommand.description = definition.description);
        assert(testCommand.options == definition.options);
        assert(testCommand.subcommands.length == 0);
    });

    it('Should execute tests when valid tests folder is specified', async () => {
        assert(await testCommand.execute({ path: DEFAULT_PATH }));

        sinon.assert.calledOnce(eoslimeSpy);
        sinon.assert.calledWith(pathOptionSpy, DEFAULT_PATH);
        sinon.assert.calledWith(mochaAddTestFilesSpy, ["./tests/tests-mock.js"]);
        sinon.assert.calledOnce(mochaRunTestsSpy);
    });

    it('Should throw when invalid tests folder is specified', async () => {
        assert(await testCommand.execute({ path: INVALID_PATH }));

        sinon.assert.calledWith(pathOptionSpy, INVALID_PATH);
        sinon.assert.notCalled(mochaAddTestFilesSpy);
        sinon.assert.notCalled(mochaRunTestsSpy);
    });

    it('Should not throw when tests folder is empty', async () => {
        fs.removeSync('./tests/tests-mock.js');

        assert(await testCommand.execute({ path: DEFAULT_PATH }));

        sinon.assert.calledWith(pathOptionSpy, DEFAULT_PATH);
        sinon.assert.calledWith(mochaAddTestFilesSpy, []);
        sinon.assert.calledOnce(mochaRunTestsSpy);
    });

    it('Should execute tests when path to file with tests is provided', async () => {
        assert(await testCommand.execute({ path: `${DEFAULT_PATH}/tests-mock.js` }));
        
        sinon.assert.calledWith(pathOptionSpy, `${DEFAULT_PATH}/tests-mock.js`);
        sinon.assert.calledOnce(mochaAddTestFilesSpy);
        sinon.assert.calledOnce(mochaRunTestsSpy);
    });

    it('Should not throw when file without tests is provided', async () => {
        fs.createFileSync('./tests.txt');

        assert(await testCommand.execute({ path: './tests.txt' }));

        sinon.assert.calledWith(pathOptionSpy, './tests.txt');
        sinon.assert.calledOnce(mochaAddTestFilesSpy);
        sinon.assert.calledOnce(mochaRunTestsSpy);
    });

    it('Should execute tests when valid network is specified', async () => {
        assert(await testCommand.execute({ path: DEFAULT_PATH, network: DEFAULT_NETWORK }));

        sinon.assert.calledWith(networkOptionSpy, DEFAULT_NETWORK);
        sinon.assert.calledOnce(providerFactorySpy);
        sinon.assert.calledOnce(mochaSetDescribeArgs);
        sinon.assert.calledOnce(mochaRunTestsSpy);
    });

    it('Should execute tests when custom network url and chainId are provided', async () => {
        assert(await testCommand.execute({ path: DEFAULT_PATH, network: CUSTOM_NETWORK }));

        sinon.assert.calledWith(networkOptionSpy, CUSTOM_NETWORK);
        sinon.assert.calledOnce(providerFactorySpy);
        sinon.assert.calledOnce(mochaSetDescribeArgs);
        sinon.assert.calledOnce(mochaRunTestsSpy);
    });

    it('Should throw when invalid network is specified', async () => {
        assert(await testCommand.execute({ path: DEFAULT_PATH, network: INVALID_NETWORK }));

        sinon.assert.calledWith(networkOptionSpy, INVALID_NETWORK);
        sinon.assert.notCalled(providerFactorySpy);
        sinon.assert.notCalled(mochaRunTestsSpy);
    });

    it('Should execute tests and display resource usage report', async () => {
        assert(await testCommand.execute({ path: DEFAULT_PATH, network: DEFAULT_NETWORK, 'resource-usage': 'true' }));

        sinon.assert.calledWith(resourceReportOptionSpy, 'true');
        sinon.assert.calledOnce(mochaRunTestsSpy);
        // sinon.assert.calledOnce(reportTableSpy);
    });

    it('Should execute tests and display resource usage report', async () => {
        assert(await testCommand.execute({ path: DEFAULT_PATH, network: DEFAULT_NETWORK, 'resource-usage': 'false' }));

        sinon.assert.calledWith(resourceReportOptionSpy, 'false');
        sinon.assert.calledOnce(mochaRunTestsSpy);
        // sinon.assert.notCalled(reportTableSpy);
    });
    
});