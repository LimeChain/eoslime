const nodeosJSON = require('./nodeos.json');
const fileSystemUtil = require('../../../../helpers/file-system-util');

const nodeosDataManager = {
    defaultPath: () => { return __dirname },
    nodeosPath: () => {
        return nodeosJSON.nodeosPath;
    },
    setNodeosPath: (path) => {
        const newPath = JSON.stringify({ nodeosPath: path });
        fileSystemUtil.writeFile(`${__dirname}/nodeos.json`, newPath);
    },
    nodeosIsRunning: function (path) {
        try {
            const pid = fileSystemUtil.readFile(path + '/eosd.pid').toString();
            return process.kill(pid, 0);
        }
        catch (e) {
            return e.code === 'EPERM'
        }
    },
    requireRunningNodeos: function (path) {
        if (!nodeosDataManager.nodeosIsRunning(path)) {
            throw new Error('Check if another nodeos has been started already');
        }
    }
}

module.exports = nodeosDataManager;
