const fs = require('fs');


const fileSystemUtils = {
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
    recursivelyReadDir(dirPath) {
        const files = [];

        fs.readdir(dirPath, function (err, filenames) {
            if (err) {
                throw new Error(err.message);
            }

            filenames.forEach(function (filePath) {
                if (fileSystemUtils.isDir(filePath)) {
                    files.concat(recursivelyReadDir(filePath));
                } else {
                    files.push(`${__dirname}/${filePath}`);
                }
            });
        });

        return files;
    },
    forEachFileInDir: (dirPath, actionCallback) => {
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

module.exports = fileSystemUtils;
