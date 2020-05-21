#!/usr/bin/env node
const exec = require('child_process').exec;
const CommandDefiner = require('./cli-commands/command-definer');

const InitCommand = require('./cli-commands/commands/init');
const TestCommand = require('./cli-commands/commands/test');
const ShapeCommand = require('./cli-commands/commands/shape');
const NodeosCommand = require('./cli-commands/commands/nodeos');
const DeployCommand = require('./cli-commands/commands/deploy');
const CompileCommand = require('./cli-commands/commands/compile');

const MochaFramework = require('./cli-commands/commands/test/specific/test-frameworks/mocha');

(() => {

    let menu = require('yargs');

    const commandDefiner = new CommandDefiner(menu);

    const initCommand = new InitCommand();
    const testCommand = new TestCommand(MochaFramework);
    const shapeCommand = new ShapeCommand();
    const nodeosCommand = new NodeosCommand();
    const deployCommand = new DeployCommand();
    const compileCommand = new CompileCommand();

    menu.command(commandDefiner.define(nodeosCommand));
    menu.command(commandDefiner.define(initCommand));
    menu.command(commandDefiner.define(compileCommand));
    menu.command(commandDefiner.define(testCommand));
    menu.command(commandDefiner.define(deployCommand));
    menu.command(commandDefiner.define(shapeCommand));

    menu.command({
        command: '*',
        handler (args) {
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