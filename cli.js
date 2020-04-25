#!/usr/bin/env node
const exec = require('child_process').exec;

const InitCommand = require('./cli-commands/init');
const TestCommand = require('./cli-commands/test');
const ShapeCommand = require('./cli-commands/shape');
const NodeosCommand = require('./cli-commands/nodeos');
const DeployCommand = require('./cli-commands/deploy');
const CompileCommand = require('./cli-commands/compile');

const StartCommand = require('./cli-commands/nodeos/subcommands/start');
const StopCommand = require('./cli-commands/nodeos/subcommands/stop');
const ShowCommand = require('./cli-commands/nodeos/subcommands/show');

const MochaFramework = require('./cli-commands/test/test-frameworks/mocha');

(() => {

    let menu = require('yargs');

    const initCommand = new InitCommand();
    const testCommand = new TestCommand();
    const shapeCommand = new ShapeCommand();
    const nodeosCommand = new NodeosCommand();
    const deployCommand = new DeployCommand();
    const compileCommand = new CompileCommand();

    // nodeos subcommands
    const startCommand = new StartCommand();
    const stopCommand = new StopCommand();
    const showCommand = new ShowCommand();

    menu.usage('Usage: $0 [command]');
    menu.command(initCommand.template, initCommand.description, InitCommand.defineCommandOptions(initCommand), InitCommand.executeWithContext(initCommand));
    menu.command(testCommand.template, testCommand.description, TestCommand.defineCommandOptions(testCommand), TestCommand.executeWithContext(testCommand, MochaFramework));
    menu.command(shapeCommand.template, shapeCommand.description, ShapeCommand.defineCommandOptions(shapeCommand), ShapeCommand.executeWithContext(shapeCommand));
    menu.command(nodeosCommand.template, nodeosCommand.description, NodeosCommand.defineSubcommands(nodeosCommand, [startCommand, stopCommand, showCommand]));
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

    menu.help();
    menu.version();
    menu.demandCommand();
    menu.recommendCommands();
    menu.showHelpOnFail();
    menu.argv;
})();