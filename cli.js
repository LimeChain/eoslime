#!/usr/bin/env node
const exec = require('child_process').exec;
const CommandDefiner = require('./cli-commands/command-definer');

const VersionCommand = require('./cli-commands/commands/version');
const InstallCommand = require('./cli-commands/commands/install');
const InitCommand = require('./cli-commands/commands/init');
const CompileCommand = require('./cli-commands/commands/compile');
const NodeosCommand = require('./cli-commands/commands/nodeos');
const TestCommand = require('./cli-commands/commands/test');
const DeployCommand = require('./cli-commands/commands/deploy');
const ShapeCommand = require('./cli-commands/commands/shape');

const MochaFramework = require('./cli-commands/commands/test/specific/test-frameworks/mocha');

(() => {

    let menu = require('yargs');

    const commandDefiner = new CommandDefiner(menu);

    const versionCommand = new VersionCommand();
    const installCommand = new InstallCommand();
    const initCommand = new InitCommand();
    const compileCommand = new CompileCommand();
    const nodeosCommand = new NodeosCommand();
    const testCommand = new TestCommand(MochaFramework);
    const deployCommand = new DeployCommand();
    const shapeCommand = new ShapeCommand();

    menu.command(commandDefiner.define(versionCommand));
    menu.command(commandDefiner.define(installCommand));
    menu.command(commandDefiner.define(initCommand));
    menu.command(commandDefiner.define(compileCommand));
    menu.command(commandDefiner.define(nodeosCommand));
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
    menu.version(false);
    menu.demandCommand();
    menu.recommendCommands();
    menu.showHelpOnFail();
    menu.argv;
})();
