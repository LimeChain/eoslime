#!/usr/bin/env node
const exec = require('child_process').exec;

const InitCommand = require('./cli-commands/init');
const TestCommand = require('./cli-commands/test');
const ShapeCommand = require('./cli-commands/shape');
const NodeosCommand = require('./cli-commands/nodeos');
const DeployCommand = require('./cli-commands/deploy');
const CompileCommand = require('./cli-commands/compile');

const MochaFramework = require('./cli-commands/test/test-frameworks/mocha');

(() => {

    let menu = require('yargs');

    const initCommand = new InitCommand();
    const testCommand = new TestCommand();
    const shapeCommand = new ShapeCommand();
    const nodeosCommand = new NodeosCommand();
    const deployCommand = new DeployCommand();
    const compileCommand = new CompileCommand();

    menu.usage('Usage: $0 [command]');

    menu.command(initCommand.define());
    menu.command(testCommand.define(MochaFramework));
    menu.command(shapeCommand.define());
    menu.command(nodeosCommand.define());
    menu.command(deployCommand.define());
    menu.command(compileCommand.define());

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