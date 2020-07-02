const fs = require('fs-extra');
const sinon = require('sinon');
const assert = require('assert');
const prompts = require('prompts');
const eoslime = require('../../index');

const logger = require('../../cli-commands/common/logger');
const Command = require('../../cli-commands/commands/command');
const Account = require('../../src/account/normal-account/account');
const DeployCommand = require('../../cli-commands/commands/deploy/index');
const definition = require('../../cli-commands/commands/deploy/definition');
const PathOption = require('../../cli-commands/commands/deploy/options/path-option');
const NetworkOption = require('../../cli-commands/commands/deploy/options/network-option');
const DeployerOption = require('../../cli-commands/commands/deploy/options/deployer-option');

describe('DeployCommand', function () {
    const TEST_DIR = './cli-commands-test';
    const DEFAULT_PATH = './deployment';
    const INVALID_PATH = './unknown_folder';
    const DEFAULT_NETWORK = 'local';
    const INVALID_NETWORK = 'invalid_network';
    const CUSTOM_NETWORK = { url: "https://test.custom.net", chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f" };
    const DEPLOYER_NAME = 'alice';
    const DEPLOYER_PERMISSION = 'active';
    const DEPLOYER_PRIVATE_KEY = '5JymWHYohPMXTckmmFkmiRZZDQTWN91eDFSnEvjYAbXTd6oFtie';
    const INVALID_PRIVATE_KEY = 'invalid_private_key';

    let initialDir;
    let deployCommand;
    let eoslimeSpy;
    let pathOptionSpy;
    let networkOptionSpy;
    let deployerOptionSpy;

    before(async () => {
        initialDir = process.cwd();
        fs.mkdirSync(TEST_DIR);
        process.chdir(TEST_DIR);
    });

    beforeEach(async () => {
        deployCommand = new DeployCommand();
        eoslimeSpy = sinon.spy(eoslime, "init");
        pathOptionSpy = sinon.spy(PathOption, "process");
        networkOptionSpy = sinon.spy(NetworkOption, "process");
        deployerOptionSpy = sinon.spy(DeployerOption, "process");
        sinon.stub(logger, "info");
        sinon.stub(logger, "error");
        
        preloadDeploymentScript();
    });

    afterEach(async () => {
        sinon.restore();
        fs.removeSync('./contracts');
        fs.removeSync('./deployment');
    });
    
    after(async () => {
        process.chdir(initialDir);
        fs.removeSync(TEST_DIR);
    });

    function preloadDeploymentScript () {
        fs.mkdirSync('./deployment');
        fs.copyFileSync('../tests/cli-commands/mocks/deployment.js', './deployment/deployment.js');
    }

    it('Should initialize command properly', async () => {
        assert(deployCommand instanceof Command);
        assert(deployCommand.template == definition.template);
        assert(deployCommand.description = definition.description);
        assert(deployCommand.options == definition.options);
        assert(deployCommand.subcommands.length == 0);
    });

    it('Should deploy when valid deployment folder is specified', async () => {
        assert(await deployCommand.execute({ path: DEFAULT_PATH }));

        sinon.assert.calledWith(pathOptionSpy, DEFAULT_PATH);
        
        let result = await pathOptionSpy.returnValues[0];
        assert(result[0].fileName, 'deployment.js');
        assert(typeof(result[0].deploy) == 'function');
        assert(result[0].deploy.name, 'deploy');
    });

    it('Should throw when invalid deployment folder is specified', async () => {
        assert(await deployCommand.execute({ path: INVALID_PATH }));

        sinon.assert.calledWith(pathOptionSpy, INVALID_PATH);
    });

    it('Should not throw when deployment folder is empty', async () => {
        assert(await deployCommand.execute({ path: DEFAULT_PATH }));

        sinon.assert.calledWith(pathOptionSpy, DEFAULT_PATH);
    });

    it('Should deploy when valid deployment script is specified', async () => {
        assert(await deployCommand.execute({ path: `${DEFAULT_PATH}/deployment.js` }));

        sinon.assert.calledWith(pathOptionSpy, `${DEFAULT_PATH}/deployment.js`);
        
        let result = await pathOptionSpy.returnValues[0];
        assert(result[0].fileName, 'deployment.js');
        assert(typeof(result[0].deploy) == 'function');
        assert(result[0].deploy.name, 'deploy');
    });

    it('Should throw when invalid deployment script is specified', async () => {
        fs.createFileSync('./test.txt');

        assert(await deployCommand.execute({ path: './test.txt', network: DEFAULT_NETWORK }));

        sinon.assert.calledWith(pathOptionSpy, './test.txt');
    });

    it('Should deploy when valid deployment network is specified', async () => {
        assert(await deployCommand.execute({ path: DEFAULT_PATH, network: DEFAULT_NETWORK }));

        sinon.assert.calledWith(networkOptionSpy, DEFAULT_NETWORK);
        sinon.assert.calledWith(eoslimeSpy, DEFAULT_NETWORK);
        
        let result = await networkOptionSpy.returnValues[0];
        assert(result.hasOwnProperty('Account'));
        assert(result.hasOwnProperty('Contract'));
        assert(result.hasOwnProperty('Provider'));
        assert(result.hasOwnProperty('MultiSigAccount'));
    });

    it('Should deploy when custom network url and chainId are provided', async () => {
        assert(await deployCommand.execute({ path: DEFAULT_PATH, network: CUSTOM_NETWORK }));

        sinon.assert.calledWith(networkOptionSpy, CUSTOM_NETWORK);
        sinon.assert.calledWith(eoslimeSpy, CUSTOM_NETWORK);
        
        let result = await networkOptionSpy.returnValues[0];
        assert(result.hasOwnProperty('Account'));
        assert(result.hasOwnProperty('Contract'));
        assert(result.hasOwnProperty('Provider'));
        assert(result.hasOwnProperty('MultiSigAccount'));
    });

    it('Should throw when invalid network is specified', async () => {
        assert(await deployCommand.execute({ path: DEFAULT_PATH, network: INVALID_NETWORK }));

        sinon.assert.calledWith(networkOptionSpy, INVALID_NETWORK);
    });

    it('Should deploy when deployer is provided', async () => {
        prompts.inject(`${DEPLOYER_PRIVATE_KEY}@${DEPLOYER_PERMISSION}`);
        
        assert(await deployCommand.execute({ path: DEFAULT_PATH, network: DEFAULT_NETWORK, deployer: DEPLOYER_NAME }));

        sinon.assert.calledWith(deployerOptionSpy, DEPLOYER_NAME);
        
        let result = await deployerOptionSpy.returnValues[0];
        assert(result instanceof Account);
        assert(result.name == DEPLOYER_NAME);
        assert(result.privateKey == DEPLOYER_PRIVATE_KEY);
        assert(result.executiveAuthority.permission == DEPLOYER_PERMISSION);
    });

    it('Should deploy when deployer is provided [permission missing]', async () => {
        prompts.inject(`${DEPLOYER_PRIVATE_KEY}`);
        
        assert(await deployCommand.execute({ path: DEFAULT_PATH, network: DEFAULT_NETWORK, deployer: DEPLOYER_NAME }));

        sinon.assert.calledWith(deployerOptionSpy, DEPLOYER_NAME);
        
        let result = await deployerOptionSpy.returnValues[0];
        assert(result instanceof Account);
        assert(result.name == DEPLOYER_NAME);
        assert(result.privateKey == DEPLOYER_PRIVATE_KEY);
        assert(result.executiveAuthority.permission == 'active');
    });

    it('Should throw when invalid deployer private key is provided', async () => {
        prompts.inject(`${INVALID_PRIVATE_KEY}@${DEPLOYER_PERMISSION}`);

        assert(await deployCommand.execute({ path: DEFAULT_PATH, network: DEFAULT_NETWORK, deployer: DEPLOYER_NAME }));

        sinon.assert.calledWith(deployerOptionSpy, DEPLOYER_NAME);
    });

});