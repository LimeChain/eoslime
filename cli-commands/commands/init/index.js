const AsyncSoftExec = require('../../helpers/async-soft-exec');
const Command = require('../command');

const initDirectories = require('./specific/directories.json');
const initCommandDefinition = require('./definition');

const MESSAGE_COMMAND = require('./messages').COMMAND;
const fileSystemUtil = require('../../helpers/file-system-util');

const defaultPackageJsonDestination = `${__dirname}/specific/default-package.json`;

// eoslime init --with-example

class InitCommand extends Command {

    constructor () {
        super(initCommandDefinition);
    }

    async execute (args) {

        try {
            MESSAGE_COMMAND.Start();

            createContractsDir();
            createDeploymentDir();
            createTestsDir();
            copyDefaultPackageJson();

            await super.processOptions(args);

            const asyncSoftExec = new AsyncSoftExec('npm install eoslime');
            await asyncSoftExec.exec();

            MESSAGE_COMMAND.Success();
        } catch (error) {
            MESSAGE_COMMAND.Error(error);
        }
    }
}

const createContractsDir = function () {
    fileSystemUtil.createDir(initDirectories.CONTRACTS);
}

const createDeploymentDir = function () {
    fileSystemUtil.createDir(initDirectories.DEPLOYMENT);
}

const createTestsDir = function () {
    fileSystemUtil.createDir(initDirectories.TESTS);
}

const copyDefaultPackageJson = function () {
    fileSystemUtil.copyFileFromTo(defaultPackageJsonDestination, initDirectories.PACKAGE_JSON);
}

module.exports = InitCommand;
