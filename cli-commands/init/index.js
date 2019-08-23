const AsyncSoftExec = require('./../utils/async-soft-exec');

const Command = require('./../command');

const initDirectories = require('./directories');
const initCommandDefinition = require('./definition');

const commandMessages = require('./messages');
const fileSystemUtil = require('./../utils/file-system-util');

const defaultPackageJsonDestination = `${__dirname}/default-package.json`;

// eoslime init --with-example

class InitCommand extends Command {

    constructor() {
        super(initCommandDefinition);
    }

    defineOptions(yargs) {
        super.defineOptions(yargs, initCommandDefinition.options);
    }

    async execute(args) {
        try {
            commandMessages.Installation();

            createContractsDir();
            createDeploymentDir();
            createTestsDir();
            copyDefaultPackageJson();

            super.processOptions(args);
        } catch (error) {
            commandMessages.UnsuccessfulInstallation(error);
        }

        const asyncSoftExec = new AsyncSoftExec('npm install eoslime');
        asyncSoftExec.onError((error) => { commandMessages.UnsuccessfulInstallation(error); });
        asyncSoftExec.onSuccess(() => { commandMessages.SuccessfulInstallation(); });

        await asyncSoftExec.exec();
    }
}

let createContractsDir = function () {
    fileSystemUtil.createDir(initDirectories.CONTRACTS);
}

let createDeploymentDir = function () {
    fileSystemUtil.createDir(initDirectories.DEPLOYMENT);
}

let createTestsDir = function () {
    fileSystemUtil.createDir(initDirectories.TESTS);
}

let copyDefaultPackageJson = function () {
    fileSystemUtil.copyFileFromTo(defaultPackageJsonDestination, initDirectories.PACKAGE_JSON);
}

module.exports = InitCommand;
