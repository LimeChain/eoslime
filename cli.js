#!/usr/bin/env node
const exec = require('child_process').exec;

const InitCommand = require('./cli-commands/init');
const TestCommand = require('./cli-commands/test');
const DeployCommand = require('./cli-commands/deploy');
const CompileCommand = require('./cli-commands/compile');

const MochaFramework = require('./cli-commands/test/test-frameworks/mocha');

(() => {

    let menu = require('yargs');

    const initCommand = new InitCommand();
    const testCommand = new TestCommand();
    const deployCommand = new DeployCommand();
    const compileCommand = new CompileCommand();

    menu.command(initCommand.template, initCommand.description, InitCommand.defineCommandOptions(initCommand), InitCommand.executeWithContext(initCommand));
    menu.command(testCommand.template, testCommand.description, TestCommand.defineCommandOptions(testCommand), TestCommand.executeWithContext(testCommand, MochaFramework));
    menu.command(deployCommand.template, deployCommand.description, DeployCommand.defineCommandOptions(deployCommand), DeployCommand.executeWithContext(deployCommand));
    menu.command(compileCommand.template, compileCommand.description, CompileCommand.defineCommandOptions(compileCommand), CompileCommand.executeWithContext(compileCommand));

    menu.command({
        command: '*',
        handler(args) {
            exec(`${args['$0']} help`, (error, stdout, stderr) => {
                if (error) {
                    throw new Error(`Could not execute help due to '${error}'`);
                }

                console.log(stdout);
                console.error(stderr);
            });
        }
    });

    menu.help('help');
    menu.version();
    menu.demandCommand();
    menu.recommendCommands();
    menu.showHelpOnFail();
    menu.argv;
})();