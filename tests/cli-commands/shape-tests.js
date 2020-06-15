const sinon = require('sinon');
const assert = require('assert');

const Git = require('simple-git/src/git');
const logger = require('../../cli-commands/common/logger');
const Command = require('../../cli-commands/commands/command');
const ShapeCommand = require('../../cli-commands/commands/shape/index');
const definition = require('../../cli-commands/commands/shape/definition');
const repositories = require('../../cli-commands/commands/shape/specific/repositories.json');
const FrameworkOption = require('../../cli-commands/commands/shape/options/framework-option');

describe('ShapeCommand', function () {
    const FRAMEWORK_REACT = "react";
    const NOT_SUPPORTED_FRAMEWORK = "angular";

    let shapeCommand;
    let simpleGitSpy;
    let frameworkOptionSpy;

    beforeEach(async () => {
        shapeCommand = new ShapeCommand();
        frameworkOptionSpy = sinon.spy(FrameworkOption, "process");
        sinon.stub(logger, "info");
        sinon.stub(logger, "error");
    });

    afterEach(async () => {
        sinon.restore();
    });

    it('Should initialize command properly', async () => {
        assert(shapeCommand instanceof Command);
        assert(shapeCommand.template == definition.template);
        assert(shapeCommand.description = definition.description);
        assert(shapeCommand.options == definition.options);
        assert(shapeCommand.subcommands.length == 0);
    });

    it('Should prepare React project', async () => {
        sinon.stub(Git.prototype, 'clone').callsFake(function (command, callback) {
            callback.call();
        });
        
        assert(await shapeCommand.execute({ framework: FRAMEWORK_REACT }));

        sinon.assert.calledWith(frameworkOptionSpy, FRAMEWORK_REACT);
        assert(frameworkOptionSpy.returnValues[0] == repositories[FRAMEWORK_REACT]);
    });

    it('Should throw when an unknown front-end framework is specified', async () => {
        simpleGitSpy = sinon.spy(Git.prototype, 'clone');
        
        assert(await shapeCommand.execute({ framework: NOT_SUPPORTED_FRAMEWORK }));

        sinon.assert.calledWith(frameworkOptionSpy, NOT_SUPPORTED_FRAMEWORK);
        assert(frameworkOptionSpy.returnValues[0] == repositories[NOT_SUPPORTED_FRAMEWORK]);
        sinon.assert.notCalled(simpleGitSpy);
    });

    it('Should throw when repository cloning fails', async () => {
        sinon.stub(Git.prototype, 'clone').throws('Test: Cloning Repo Failure');

        assert(await shapeCommand.execute({ framework: FRAMEWORK_REACT }));
    });

});