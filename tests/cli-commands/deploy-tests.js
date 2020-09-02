const path = require('path')
const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

const definition = require('../../cli-commands/commands/deploy/definition');

const Command = require('../../cli-commands/commands/command');
const DeployCommand = require('../../cli-commands/commands/deploy/index');

const NetworkOption = require('../../cli-commands/commands/deploy/options/network-option');

const Logger = require('./utils/logger');
const logger = new Logger();

describe('Deploy Command', function () {

    let deployCommand;

    beforeEach(async () => {
        logger.hide(sinon);
        deployCommand = new DeployCommand();
    });

    afterEach(async () => {
        sinon.restore();
    });

    describe('Command', function () {

        it('Should initialize command properly', async () => {
            assert(deployCommand instanceof Command);
            assert(deployCommand.template == definition.template);
            assert(deployCommand.description = definition.description);
            assert(deployCommand.options == definition.options);
            assert(deployCommand.subcommands.length == 0);
        });

        function stubBaseCommand (cb) {
            return {
                '../command': class FakeBaseCommand {
                    processOptions (args) {
                        return cb(args);
                    }
                }
            }
        }

        it('Should deploy contracts', async () => {
            const deployCommand = new (proxyquire('../../cli-commands/commands/deploy/index', {
                ...stubBaseCommand(() => {
                    return {
                        path: [{
                            deploy: (network, deployer) => {
                                assert(network == 'custom');
                                assert(deployer == 'deployer');
                            }
                        }],
                        network: 'custom',
                        deployer: 'deployer'
                    }
                })
            }));

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('success', (message) => {
                    if (message.includes('Successful deployment of')) {
                        return resolve(true);
                    }
                });

                await deployCommand.execute();
            });

            await waitToPass;
        });

        it('Should log error message in case a deployment script throws', async () => {
            const deployCommand = new (proxyquire('../../cli-commands/commands/deploy/index', {
                ...stubBaseCommand(() => {
                    return {
                        path: [{
                            deploy: () => {
                                throw new Error('Fake Error');
                            }
                        }]
                    }
                })
            }));

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('error', (message) => {
                    if (message.includes('Unsuccessful deployment of')) {
                        return resolve(true);
                    }
                });

                await deployCommand.execute();
            });

            await waitToPass;
        });

        it('Should log error message in case of error', async () => {
            const deployCommand = new (proxyquire('../../cli-commands/commands/deploy/index', {
                ...stubBaseCommand(() => { throw new Error('Fake error'); })
            }));

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('error', (message) => {
                    if (message.includes(' Unsuccessful deployment')) {
                        return resolve(true);
                    }
                });

                await deployCommand.execute();
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
                            return [{ fileName: 'fileName', fullPath: `${dir}/fullPath` }];
                        }
                    }
                }
            }

            function stubDeploymentPath (deploymentPath) {
                return {
                    [deploymentPath]: 'deploymentPath'
                }
            }

            it('Should return a deployment script', async () => {
                const pathOption = proxyquire('../../cli-commands/commands/deploy/options/path-option', {
                    ...stubFileSystemUtils(false),
                    ...stubDeploymentPath(path.resolve('./', './custom.js'))
                });

                const deploymentScript = (await pathOption.process('./custom.js'))[0];
                assert(deploymentScript.fileName == './custom.js');
                assert(deploymentScript.deploy == 'deploymentPath');
            });

            it('Should return all deployment scripts from folder', async () => {
                const pathOption = proxyquire('../../cli-commands/commands/deploy/options/path-option', {
                    ...stubFileSystemUtils(true),
                    ...stubDeploymentPath(path.resolve('./', './custom/fullPath'))
                });

                const deploymentScripts = await pathOption.process('./custom');
                assert(deploymentScripts[0].fileName == 'fileName');
                assert(deploymentScripts[0].deploy == 'deploymentPath');
            });
        });

        describe('Network', function () {

            it('Should return an instance of eoslime', async () => {
                const eoslimeInstance = NetworkOption.process('local');
                assert(eoslimeInstance.Provider.network.name == 'local');
            });
        });

        describe('Deployer', function () {

            function stubPrompts (output) {
                return {
                    'prompts': () => { return { value: output } }
                }
            }

            it('Should return an instance of eoslime.Account', async () => {
                const deployerOption = proxyquire('../../cli-commands/commands/deploy/options/deployer-option', {
                    ...stubPrompts('5KieRy975NgHk5XQfn8r6o3pcqJDF2vpeV9bDiuB5uF4xKCTwRF@active')
                });

                const deployer = await deployerOption.process('name', { network: 'local' });

                assert(deployer.constructor.name == 'Account');
                assert(deployer.name == 'name');
                assert(deployer.privateKey == '5KieRy975NgHk5XQfn8r6o3pcqJDF2vpeV9bDiuB5uF4xKCTwRF');
                assert(deployer.authority.permission == 'active');
            });
        });
    });
});
