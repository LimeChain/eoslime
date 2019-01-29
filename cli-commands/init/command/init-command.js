const exec = require('child_process').exec;

const Command = require('./../../command');

const initDirectories = require('./init-directories');
const initCommandDefinition = require('./init-command-definition');

const commandMessages = require('./command-messages');
const fileSystemUtil = require('../../utils/file-system-util');

const defaultPackageJsonDestination = `${__dirname}/default-package.json`;

// eoslime init --with-example

class InitCommand extends Command {

    constructor() {
        super(initCommandDefinition.template, initCommandDefinition.description);
    }

    defineOptions(yargs) {
        super.defineOptions(yargs, initCommandDefinition.options);
    }

    execute(args) {
        try {
            commandMessages.Installation();

            createContractsDir();
            createDeploymentDir();
            createTestsDir();
            copyDefaultPackageJson();

            super.__execute(args, initCommandDefinition.options);
        } catch (error) {
            commandMessages.UnsuccessfulInstallation();
            throw new Error(error.message);
        }

        exec('npm install eoslime', (error) => {
            if (error) {
                commandMessages.UnsuccessfulInstallation();
            }

            commandMessages.SuccessfulInstallation();
        });
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

module.exports = new InitCommand();
