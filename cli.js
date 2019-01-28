const exec = require('child_process').exec;

(() => {

    let menu = require('yargs');

    menu.command({
        command: '*',
        handler(args) {
            exec(`${args['$0']} help`, (err, stdout, stderr) => {
                if (err) {
                    throw new Error(`Could not execute help due to '${stderr}'`);
                }
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