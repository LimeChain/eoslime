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
    recursivelyReadDir: async function (dirPath) {
        return new Promise(async (resolve, reject) => {
            let files = [];

            fs.readdir(dirPath, async function (err, filenames) {
                if (err) {
                    return void reject(err.message);
                }

                for (let i = 0; i < filenames.length; i++) {
                    const fileName = filenames[i];

                    if (fileSystemUtils.isDir(`${dirPath}/${fileName}`)) {
                        const dirFiles = await fileSystemUtils.recursivelyReadDir(`${dirPath}/${fileName}`);
                        files = files.concat(dirFiles);
                    } else {
                        files.push({
                            fileName: fileName,
                            fullPath: `${dirPath}/${fileName}`
                        });
                    }
                }

                resolve(files);
            });
        });
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
