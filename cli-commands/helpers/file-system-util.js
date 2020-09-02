const fs = require('fs');
const path = require('path');

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
        let files = [];

        await fileSystemUtils.forEachFileInDir(dirPath, async (fileName) => {

            if (fileSystemUtils.isDir(`${dirPath}/${fileName}`)) {
                const dirFiles = await fileSystemUtils.recursivelyReadDir(`${dirPath}/${fileName}`);
                files = files.concat(dirFiles);
            } else {
                files.push({
                    fileName: fileName,
                    fullPath: `${dirPath}/${fileName}`
                });
            }
        });

        return files;
    },
    recursivelyDeleteDir: async function (dirPath) {
        await fileSystemUtils.forEachFileInDir(dirPath, async (fileName) => {
            if (fileSystemUtils.isDir(path.join(dirPath, fileName))) {
                await fileSystemUtils.recursivelyDeleteDir(path.join(dirPath, fileName));
            } else {
                fileSystemUtils.rmFile(path.join(dirPath, fileName));
            }
        });


        fileSystemUtils.rmDir(dirPath);
    },
    forEachFileInDir: (dirPath, actionCallback) => {
        return new Promise((resolve, reject) => {
            fs.readdir(dirPath, async function (err, fileNames) {
                if (err) {
                    return void reject(err.message);
                }

                for (let i = 0; i < fileNames.length; i++) {
                    const fileName = fileNames[i];
                    await actionCallback(fileName);
                }

                resolve();
            });
        });
    },
    readFile: (filePath) => {
        return fs.readFileSync(filePath);
    },
    writeFile: (filePath, fileContent) => {
        try {
            fs.writeFileSync(filePath, fileContent);
        } catch (err) {
            throw new Error(`Storing content failed: ${err.message}`)
        }
    },
    rmFile: (filePath) => {
        fs.unlinkSync(filePath);
    },
    rmDir: (dirPath) => {
        fs.rmdirSync(dirPath);
    }
}

module.exports = fileSystemUtils;
