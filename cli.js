#!/usr/bin/env node
const exec = require('child_process').exec;

const InitCommand = require('./cli-commands/init');
const DeployCommand = require('./cli-commands/deploy/');
const CompileCommand = require('./cli-commands/compile/');

(() => {

    let menu = require('yargs');

    const initCommand = new InitCommand();
    const deployCommand = new DeployCommand();
    const compileCommand = new CompileCommand();

    menu.command(initCommand.template, initCommand.description, InitCommand.defineCommandOptions(initCommand), InitCommand.executeWithContext(initCommand));
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