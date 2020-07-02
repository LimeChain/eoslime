const fs = require('fs-extra');
const sinon = require('sinon');
const assert = require('assert');

const fileSystemUtil = require('../../../cli-commands/helpers/file-system-util');

describe('FileSystemUtil', function () {
    const TEST_DIR = './cli-commands-test';

    before(async () => {
        initialDir = process.cwd();
        fs.mkdirSync(TEST_DIR);
        process.chdir(TEST_DIR);
    });

    beforeEach(async () => {
        fs.mkdirSync('./root');
        fs.mkdirSync('./root/child');
        fs.createFileSync('./root/sample.txt');
    });

    afterEach(async () => {
        sinon.restore();
        fs.removeSync('./root');
    });

    after(async () => {
        process.chdir(initialDir);
        fs.removeSync(TEST_DIR);
    });

    it('Should recursively read dir content', async () => {
        let files = await fileSystemUtil.recursivelyReadDir('root');

        assert(files.length == 1);
        assert(files[0].fileName == 'sample.txt');
        assert(files[0].fullPath == 'root/sample.txt');fs.removeSync('./root');
    });

    it('Should recursively delete dir content', async () => {
        await fileSystemUtil.recursivelyDeleteDir('root');

        assert(!fs.existsSync('./root'));
    });

    it('Should create new file', async () => {
        fileSystemUtil.writeFile('sample.txt', 'text');

        assert(fs.existsSync('sample.txt'));

        fs.removeSync('sample.txt');
    });

    it('Should throw when trying to create undefined file', async () => {
        try {
            fileSystemUtil.writeFile(undefined, 'text');
        } catch (error) {
            assert(error.message.includes('Storing content failed'));
        }
    });

});