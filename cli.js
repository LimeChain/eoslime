#!/usr/bin/env node
const exec = require('child_process').exec;

const initCommand = require('./cli-commands/init/command/init-command');
const deployCommand = require('./cli-commands/deploy/command/deploy-command');

(() => {

    let menu = require('yargs');

    menu.command(initCommand.template, initCommand.description, initCommand.defineOptions, initCommand.execute);
    menu.command(deployCommand.template, deployCommand.description, deployCommand.defineOptions, deployCommand.execute);

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