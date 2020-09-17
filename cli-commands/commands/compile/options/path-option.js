const fileSystemUtil = require('../../../helpers/file-system-util');
const path = require('path');

const Option = require('../../option');

class PathOption extends Option {

    constructor () {
        super(
            'path',
            {
                "describe": "Path to the contract/s file/folder",
                "type": "string",
                "default": "./contracts/"
            }
        );
    }

    async process (optionValue) {
        if (fileSystemUtil.isDir(optionValue)) {
            const dirFiles = await fileSystemUtil.recursivelyReadDir(optionValue);
            const cppFiles = dirFiles.filter(dirFile => dirFile.fileName.endsWith('.cpp'));
            // Get relative paths from base path
            const relFiles = cppFiles.map(f => { f.relativePath = path.relative(optionValue,f.fullPath); return f; });
            // Group by contract
            const contractsFiles = relFiles.reduce((groups, f) => {
                let contract = path.dirname(f.relativePath);
                if (contract === '' || contract === '.') contract = path.basename(f.fileName, '.cpp');
                if (!groups[contract]) groups[contract] = [];
                groups[contract].push(f.fullPath);
                return groups;
            }, {});
            // Return the contracts files groups
            return Object.keys(contractsFiles).map((contract) => {
                return {
                    name: contract,
                    files: contractsFiles[contract]
                }
            });
        }
        // Single file
        return optionValue.endsWith('.cpp') ? [{ name: path.basename(optionValue, '.cpp'), files: [optionValue] }] : [];
    }
}

module.exports = new PathOption();
