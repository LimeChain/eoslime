const path = require('path');
const fileSystemUtil = require('./../../../helpers/file-system-util');

const Option = require('./../../../option');

class WithExampleOption extends Option {

    constructor() {
        super(
            'with-example',
            {
                "describe": "Provides eosio.token contract and tests as an example for usage",
                "type": "boolean"
            }
        );
    }

    process(optionValue) {
        if (optionValue) {
            fileSystemUtil.createDir('./contracts/example/');

            const exampleContractsDestination = path.join(__dirname, './contract-example/');
            fileSystemUtil.copyAllFilesFromDirTo(exampleContractsDestination, './contracts/example/');

            const exampleDeploymentFileDestination = path.join(__dirname, './deployment-example/deployment.js');
            fileSystemUtil.copyFileFromTo(exampleDeploymentFileDestination, './deployment/example-deploy.js');

            const exampleTestsFileDestination = path.join(__dirname, './tests-example/tests.js');
            fileSystemUtil.copyFileFromTo(exampleTestsFileDestination, './tests/example-tests.js');
        }
    }
}

module.exports = new WithExampleOption();
