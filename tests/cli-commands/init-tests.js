const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

const definition = require('../../cli-commands/commands/init/definition');

const Command = require('../../cli-commands/commands/command');
const InitCommand = require('../../cli-commands/commands/init/index');

const Logger = require('./utils/logger');
const logger = new Logger();

describe('Init Command', function () {

    beforeEach(async () => {
        logger.hide(sinon);
    });

    afterEach(async () => {
        sinon.restore();
    });

    describe('Command', function () {

        it('Should initialize command properly', async () => {
            const initCommand = new InitCommand();
            assert(initCommand instanceof Command);
            assert(initCommand.template == definition.template);
            assert(initCommand.description = definition.description);
            assert(initCommand.options == definition.options);
            assert(initCommand.subcommands.length == 0);
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

        function stubFileSystemUtils (checkPoints) {
            return {
                '../../helpers/file-system-util': {
                    createDir: () => {
                        checkPoints.createDir--;
                    },
                    copyFileFromTo: () => {
                        checkPoints.copyFileFromTo--;
                    }
                }
            }
        }

        function stubAsyncSoftExec (checkPoints) {
            return {
                '../../helpers/async-soft-exec': class FakeAsyncSoftExec {
                    exec () { checkPoints.exec--; }
                }
            }
        }

        it('Should init project structure', async () => {
            const checkPoints = {
                exec: 1,
                createDir: 3,
                copyFileFromTo: 1,
            }

            const initCommand = new (proxyquire('../../cli-commands/commands/init/index', {
                ...stubAsyncSoftExec(checkPoints),
                ...stubFileSystemUtils(checkPoints),
                ...stubBaseCommand((args) => {
                    return new Promise((resolve) => {
                        assert(args['with-example'] == false);
                        resolve(true);
                    });
                })
            }));

            await initCommand.execute({ 'with-example': false });

            assert(checkPoints.exec == 0);
            assert(checkPoints.createDir == 0);
            assert(checkPoints.copyFileFromTo == 0);
        });

        it('Should log error message in case an option throws', async () => {
            const initCommand = new (proxyquire('../../cli-commands/commands/init/index', {
                ...stubAsyncSoftExec(),
                ...stubFileSystemUtils(),
                ...stubBaseCommand(() => { throw new Error('Fake error'); })
            }));

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('error', (message) => {
                    if (message.includes('Unsuccessful installation')) {
                        return resolve(true);
                    }
                });

                await initCommand.execute({ 'with-example': true });
            });

            await waitToPass;
        });
    });

    describe('Options', function () {
        describe('With-example', function () {

            const checkPoints = {
                createDir: 1,
                copyFileFromTo: 2,
                copyAllFilesFromDirTo: 1
            }

            function stubFileSystemUtils () {
                const Option = proxyquire(
                    '../../cli-commands/commands/init/options/with-example/with-example-option',
                    {
                        '../../../../helpers/file-system-util': {
                            createDir: () => {
                                checkPoints.createDir--;
                            },
                            copyFileFromTo: () => {
                                checkPoints.copyFileFromTo--;
                            },
                            copyAllFilesFromDirTo: () => {
                                checkPoints.copyAllFilesFromDirTo--;
                            }
                        }
                    }
                );

                return Option;
            }

            it('Should init project structure [with-example = false]', async () => {
                const checkPointUntouched = JSON.stringify(checkPoints);

                const exampleOption = stubFileSystemUtils();
                exampleOption.process(false);

                assert(checkPointUntouched == JSON.stringify(checkPoints));
            });

            it('Should init project structure and provide example files', async () => {
                const exampleOption = stubFileSystemUtils();
                exampleOption.process(true);

                assert(checkPoints.createDir == 0);
                assert(checkPoints.copyFileFromTo == 0);
                assert(checkPoints.copyAllFilesFromDirTo == 0);
            });
        });
    });
});
