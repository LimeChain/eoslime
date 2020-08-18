const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

const definition = require('../../cli-commands/commands/compile/definition');

const Command = require('../../cli-commands/commands/command');
const CompileCommand = require('../../cli-commands/commands/compile/index');

const Logger = require('./utils/logger');
const logger = new Logger();

describe('Compile Command', function () {

    beforeEach(async () => {
        logger.hide(sinon);
    });

    afterEach(async () => {
        sinon.restore();
    });

    describe('Command', function () {

        it('Should initialize command properly', async () => {
            const compileCommand = new CompileCommand();
            assert(compileCommand instanceof Command);
            assert(compileCommand.template == definition.template);
            assert(compileCommand.description = definition.description);
            assert(compileCommand.options == definition.options);
            assert(compileCommand.subcommands.length == 0);
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

        function stubAsyncSoftExec (checkPoints) {
            return {
                '../../helpers/async-soft-exec': class FakeAsyncSoftExec {
                    exec () { checkPoints.exec--; }
                }
            }
        }

        it('Should compile ', async () => {
            const checkPoints = {
                exec: 1,
                createDir: 1
            }

            const compileCommand = new (proxyquire(
                '../../cli-commands/commands/compile/index',
                {
                    ...stubBaseCommand(() => {
                        return { path: [{ fileName: 'test', fullPath: './test.cpp' }] }
                    }),
                    ...stubAsyncSoftExec(checkPoints),
                    '../../helpers/file-system-util': {
                        createDir: () => {
                            checkPoints.createDir--;
                        }
                    }
                }
            ));

            await compileCommand.execute();

            assert(checkPoints.exec == 0);
            assert(checkPoints.createDir == 0);
        });

        it('Should log in case any contracts was found', async () => {
            const compileCommand = new (proxyquire('../../cli-commands/commands/compile/index',
                { ...stubBaseCommand(() => { return { path: [] } }) }
            ));

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('info', (message) => {
                    if (message.includes('There is not a contract to compile')) {
                        return resolve(true);
                    }
                });

                await compileCommand.execute({ 'path': './' });
            });

            await waitToPass;
        });

        it('Should log in case a contract could not be compiled', async () => {
            const compileCommand = new (proxyquire(
                '../../cli-commands/commands/compile/index',
                {
                    ...stubBaseCommand(() => {
                        return { path: [{ fileName: 'test', fullPath: './test.cpp' }] }
                    }),
                    '../../helpers/async-soft-exec': class FakeAsyncSoftExec {
                        exec () { throw new Error('Fake error'); }
                    },
                    '../../helpers/file-system-util': {
                        createDir: () => { }
                    }
                }
            ));

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('error', (message) => {
                    if (message.includes('Unsuccessful compilation of')) {
                        return resolve(true);
                    }
                });

                await compileCommand.execute({ 'path': './' });
            });

            await waitToPass;
        });

        it('Should log in case of an error', async () => {
            const compileCommand = new (proxyquire('../../cli-commands/commands/compile/index',
                { ...stubBaseCommand(() => { throw new Error('Fake Error') }) }
            ));

            const waitToPass = new Promise(async (resolve, reject) => {
                logger.on('error', (message) => {
                    if (message.includes('Unsuccessful compilation')) {
                        return resolve(true);
                    }
                });

                await compileCommand.execute({ 'path': './' });
            });

            await waitToPass;
        });
    });


    describe('Options', function () {
        describe('Path', function () {

            function stubFileSystemUtils (isFolder) {
                const Option = proxyquire(
                    '../../cli-commands/commands/compile/options/path-option',
                    {
                        '../../../helpers/file-system-util': {
                            isDir: () => {
                                return isFolder;
                            },
                            recursivelyReadDir: () => {
                                return [
                                    {
                                        fileName: 'test1.cpp',
                                        fullPath: `./custom/test1.cpp`
                                    }, {
                                        fileName: 'test2.cpp',
                                        fullPath: `./custom/test2.cpp`
                                    }
                                ]
                            }
                        }
                    }
                );

                return Option;
            }

            it('Should return contract path', async () => {
                const pathOption = stubFileSystemUtils(false);
                const result = await pathOption.process('./test.cpp');

                assert(result.length == 1);
                assert(result[0].fileName == 'test');
                assert(result[0].fullPath == './test.cpp');
            });

            it('Should return contracts paths from a folder', async () => {
                const pathOption = stubFileSystemUtils(true);
                const result = await pathOption.process('./test.cpp');

                assert(result.length == 2);
                assert(result[0].fileName == 'test1');
                assert(result[1].fileName == 'test2');
                assert(result[0].fullPath == './custom/test1.cpp');
                assert(result[1].fullPath == './custom/test2.cpp');
            });

            it('Should return empty array if any contracts was found', async () => {
                const pathOption = stubFileSystemUtils(false);
                const result = await pathOption.process('./test.fake');

                assert(result.length == 0);
            });
        });
    });
});
