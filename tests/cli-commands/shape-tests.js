const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

const definition = require('../../cli-commands/commands/shape/definition');

const Command = require('../../cli-commands/commands/command');
const ShapeCommand = require('../../cli-commands/commands/shape/index');

const FrameworkOption = require('../../cli-commands/commands/shape/options/framework-option');

const Logger = require('./utils/logger');
const logger = new Logger();

describe('Shape Command', function () {

    beforeEach(async () => {
        logger.hide(sinon);
    });

    afterEach(async () => {
        sinon.restore();
    });

    describe('Command', function () {

        it('Should initialize command properly', async () => {
            const shapeCommand = new ShapeCommand();

            assert(shapeCommand instanceof Command);
            assert(shapeCommand.template == definition.template);
            assert(shapeCommand.description = definition.description);
            assert(shapeCommand.options == definition.options);
            assert(shapeCommand.subcommands.length == 0);
        });

        it('Should prepare shape ', async () => {
            const shapeCommand = new (proxyquire('../../cli-commands/commands/shape/index',
                {
                    'simple-git/promise': () => {
                        return { clone: () => { assert(true); } }
                    }
                }
            ));

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('success', (message) => {
                    if (message.includes('Successful shaping')) {
                        return resolve(true);
                    }
                });

                await shapeCommand.execute({ framework: 'react' });
            });

            await waitToPass;
        });

        function stubBaseCommand (cb) {
            return {
                '../command': class FakeBaseCommand {
                    processOptions () {
                        return cb();
                    }
                }
            }
        }

        it('Should log in case of an error', async () => {
            const shapeCommand = new (proxyquire('../../cli-commands/commands/shape/index', {
                ...stubBaseCommand(() => { throw new Error('Fake error'); })
            }));

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('error', (message) => {
                    if (message.includes('Unsuccessful shaping')) {
                        return resolve(true);
                    }
                });

                await shapeCommand.execute();
            });

            await waitToPass;
        });
    });

    describe('Options', function () {
        describe('Framework', function () {

            it('Should return the repository of the shape framework', async () => {
                assert(FrameworkOption.process('react') == 'https://github.com/LimeChain/eoslime-shape-react.git');
            });

            it('Should throw in case the provided framework is not supported', async () => {
                try {
                    await FrameworkOption.process('Not supported');
                } catch (error) {
                    assert(error.message == 'Invalid Shape framework');
                }
            });
        });
    });
});
