const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

const Command = require('../../cli-commands/commands/command');
const GroupCommand = require('../../cli-commands/commands/group-command');

// Commons
const logger = require('../../cli-commands/common/logger');
const Table = require('../../cli-commands/common/table');

const Logger = require('./utils/logger');
const testLogger = new Logger();

describe('Miscellaneous', function () {

    describe('CLI Command', function () {
        it('Should process command options', async () => {
            const commandOptions = [{ name: 'test', process: (args) => { return args; } }];
            const command = new Command({ options: commandOptions });

            const result = await command.processOptions({ 'test': true });
            assert(result.test);
        });

        it('Should execute command', async () => {
            const command = new Command({});
            await command.execute();
        });
    });

    describe('Group Command', function () {
        it('Should execute provided option', async () => {
            const commandOptions = [{ name: 'test', process: (args) => { return args; } }];
            const groupCommand = new GroupCommand({ options: commandOptions });
            await groupCommand.execute({ 'test': true });

            assert(groupCommand.hasBeenExecuted);
        });

        it('Should set hasBeenExecuted to false if no option has been provided', async () => {
            const groupCommand = new GroupCommand({});
            await groupCommand.execute();

            assert(!groupCommand.hasBeenExecuted);
        });
    });

    describe('Common', function () {
        describe('Logger', function () {
            it('Should print all type of logs', async () => {
                const originalConsoleLog = console.log;
                console.log = () => { assert(true); }

                logger.log('message');
                logger.success('message');
                logger.info('message');
                logger.error('message', 'error');

                console.log = originalConsoleLog;
            });
        });

        describe('Table', function () {

            it('Should add a row', async () => {
                const table = new Table(['head']);
                table.addRow(['row']);

                assert(table.table[0][0] == 'row');
            });

            it('Should add a section', async () => {
                const table = new Table(['head']);
                table.addSection('sectionName', [['row']]);

                assert(Array.isArray(table.table[0]['\u001b[96msectionName\u001b[39m']));
                assert(table.table[1][0] == '');
                assert(table.table[1][1] == 'row');
            });

            it('Should visualize the table', async () => {
                testLogger.hide(sinon);
                testLogger.on('log', (table) => {
                    console.log(table)
                    assert(table.includes('sectionName'));
                    assert(table.includes('row'));
                });

                const table = new Table(['head']);
                table.addSection('sectionName', [['row']]);
                table.draw();

                sinon.restore();
            });
        });
    });

    describe('Helpers', function () {
        describe('AsyncSoftExec', function () {
            function stubChildProcess (error, stdout) {
                const AsyncSoftExec = proxyquire('../../cli-commands/helpers/async-soft-exec', {
                    'child_process': {
                        exec: (command, cb) => { cb(error, stdout); }
                    }
                });

                return AsyncSoftExec;
            }

            it('Should execute command', async () => {
                const AsyncSoftExec = stubChildProcess('', 'executed');
                const asyncSoftExec = new AsyncSoftExec('Test');

                const result = await asyncSoftExec.exec();
                assert(result == 'executed');
            });

            it('Should throw error when executing', async () => {
                const AsyncSoftExec = stubChildProcess('Fake error', '');
                const asyncSoftExec = new AsyncSoftExec('Test');

                try {
                    await asyncSoftExec.exec();
                    assert(false);
                } catch (error) {
                    assert(error == 'Fake error');
                }
            });
        });

        describe('File system utils', function () {

            function stubExistsSync (output) {
                return { existsSync: () => { return output; } }
            }

            function stubMkdirSync (cb) {
                return { mkdirSync: (dirName) => { cb(dirName); } }
            }

            function stubCopyFileSync (cb) {
                return { copyFileSync: (source, destination) => { cb(source, destination); } }
            }

            function stubReaddir (...output) {
                return { readdir: (dir, cb) => { cb(...output); } }
            }

            function stubLstatSyncFile (output) {
                return { lstatSync: () => { return { isFile: () => { return output; } } } }
            }

            function stubLstatSyncDir (output) {
                return { lstatSync: () => { return { isDirectory: () => { return output; } } } }
            }

            function stubReadFileSync () {
                return { readFileSync: (filePath) => { return filePath; } }
            }

            function stubWriteFileSync (cb) {
                return { writeFileSync: (filePath, fileContent) => { cb(filePath, fileContent); } }
            }

            function stubUnlinkSync () {
                return { unlinkSync: () => { } }
            }

            function stubRmdirSync () {
                return { rmdirSync: () => { } }
            }

            it('Should create dir', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubExistsSync(false),
                        ...stubMkdirSync((dir) => {
                            assert(dir == 'dir');
                        })
                    }
                });

                utils.createDir('dir');
            });

            it('Should copy file', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubExistsSync(false),
                        ...stubCopyFileSync((src, dst) => {
                            assert(src == 'here');
                            assert(dst == 'there');
                        })
                    }
                });

                utils.copyFileFromTo('here', 'there');
            });

            it('Should copy all files in dir', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubExistsSync(true),
                        ...stubCopyFileSync((src, dst) => {
                            assert(src == 'src/file');
                            assert(dst == 'dst/file');
                        }),
                        ...stubReaddir(undefined, ['file'])
                    }
                });

                utils.copyAllFilesFromDirTo('src/', 'dst/');
            });

            it('Should throw if coping of all files in dir fails', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubExistsSync(true),
                        ...stubCopyFileSync((src, dst) => {
                            assert(src == 'src/file');
                            assert(dst == 'dst/file');
                        }),
                        ...stubReaddir('error', [])
                    }
                });

                try {
                    utils.copyAllFilesFromDirTo('src/', 'dst/');
                    assert(false);
                } catch (error) {
                    assert(error.message == 'Example files can not be copied');
                }

            });

            it('Should return if path is dir', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubLstatSyncDir(true),
                    }
                });

                assert(utils.isDir('dir'));
            });

            it('Should return if path is a file', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubLstatSyncFile(true)
                    }
                });

                assert(utils.isFile('path'));
            });

            it('Should read file', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubReadFileSync(true),
                    }
                });

                assert(utils.readFile('file') == 'file');
            });

            it('Should read dir with files only', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubLstatSyncDir(false),
                        ...stubReaddir(undefined, ['file'])
                    }
                });

                const result = await utils.recursivelyReadDir('dir');
                assert(result[0].fullPath == 'dir/file');
            });

            it('Should read dir with sub dirs', async () => {
                let dirLevel = 2;
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        lstatSync: () => { return { isDirectory: () => { dirLevel--; return dirLevel; } } },
                        ...stubReaddir(undefined, ['file'])
                    }
                });

                const result = await utils.recursivelyReadDir('dir')
                assert(result[0].fullPath == 'dir/file/file');
            });

            it('Should throw if reading of a dir fails', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubReaddir({ message: 'Error' }, [])
                    }
                });

                try {
                    await utils.recursivelyReadDir('dir');
                    assert(false);
                } catch (error) {
                    assert(error == 'Error');
                }
            });

            it('Should clean up dir containing only files', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubLstatSyncDir(false),
                        ...stubReaddir(undefined, ['file']),
                        ...stubUnlinkSync(),
                        ...stubRmdirSync()
                    }
                });

                await utils.recursivelyDeleteDir('dir');
            });

            it('Should clean up dir containing sub dirs', async () => {
                let dirLevel = 2;
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        lstatSync: () => { return { isDirectory: () => { dirLevel--; return dirLevel; } } },
                        ...stubReaddir(undefined, ['file']),
                        ...stubRmdirSync(),
                        ...stubUnlinkSync()
                    }
                });

                await utils.recursivelyDeleteDir('dir');
            });

            it('Should throw if deletion of a dir fails', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubReaddir({ message: 'Error' }, [])
                    }
                });

                try {
                    await utils.recursivelyDeleteDir('dir');
                    assert(false);
                } catch (error) {
                    assert(error == 'Error');
                }
            });

            it('Should write to a file', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubWriteFileSync((path, content) => {
                            assert(path == 'path');
                            assert(content == 'content');
                        }),
                    }
                });

                utils.writeFile('path', 'content');
            });

            it('Should throw if writing to a file fails', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubWriteFileSync(() => { throw new Error('Fake error'); })
                    }
                });

                try {
                    utils.writeFile('path', 'content');
                    assert(false);
                } catch (error) {
                    assert(error.message.includes('Fake error'));
                }
            });

            it('Should remove a file', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubUnlinkSync(true),
                    }
                });

                utils.rmFile('file');
            });

            it('Should remove dir', async () => {
                const utils = proxyquire('../../cli-commands/helpers/file-system-util', {
                    'fs': {
                        ...stubRmdirSync(true),
                    }
                });

                utils.rmDir('dir');
            });
        });
    });
});
