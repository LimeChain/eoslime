const fs = require('fs');


module.exports = {
    createDir: (dirName) => {
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
        }
    },
    copyFileFromTo: (fromDestination, toDestination) => {
        if (!fs.existsSync(toDestination)) {
            fs.copyFileSync(fromDestination, toDestination);
        }
    },
    copyAllFilesFromDirTo: (dirDestination, toDestination) => {
        fs.readdir(dirDestination, function (err, filenames) {
            if (err) {
                throw new Error('Example files can not be copied');
            }

            filenames.forEach(function (filename) {
                fs.copyFileSync(`${dirDestination}${filename}`, `${toDestination}${filename}`);
            });
        });
    },
    isDir: (path) => {
        return fs.lstatSync(path).isDirectory();
    },
    isFile: (path) => {
        return fs.lstatSync(path).isFile();
    },
    executeActionForEachFileInDir: (dirPath, actionCallback) => {
        fs.readdir(dirPath, function (err, filenames) {
            if (err) {
                throw new Error(err.message);
            }

            filenames.forEach(function (filename) {
                actionCallback(filename);
            });
        });
    },
    exists: (path) => {
        return fs.existsSync(path);
    }
}