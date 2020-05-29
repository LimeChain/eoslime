const sinon = require('sinon');
const assert = require('assert');

const Git = require('simple-git/src/git');
const Command = require('../../cli-commands/commands/command');
const ShapeCommand = require('../../cli-commands/commands/shape/index');
const GroupCommand = require('../../cli-commands/commands/group-command');
const definition = require('../../cli-commands/commands/shape/definition');
const FrameworkOption = require('../../cli-commands/commands/shape/options/framework-option');

describe('ShapeCommand', function () {
    const FRAMEWORK_REACT = "react";
    const FRAMEWORK_ANGULAR = "angular";

    let shapeCommand;
    let cloneSpy;
    let processSpy;
    let processOptionsSpy;

    beforeEach(async () => {
        shapeCommand = new ShapeCommand();
        processSpy = sinon.spy(FrameworkOption, "process");
        processOptionsSpy = sinon.spy(Command.prototype, "processOptions");
    });

    afterEach(async () => {
        sinon.restore();
    });

    function prepareArgs (framework = FRAMEWORK_REACT) {
        return { _: [ 'shape' ], framework: framework, '$0': 'eoslime' };
    }

    it('Should initialize command propertly', async () => {
        assert(shapeCommand instanceof Command);
        assert(shapeCommand.template == definition.template);
        assert(shapeCommand.description = definition.description);
        assert(shapeCommand.options == definition.options);
    });

    it('Should not configure any subcommands', async () => {
        assert(!(shapeCommand instanceof GroupCommand));
        assert(shapeCommand.subcommands.length == 0);
    });

    it('Should shape a dApp with default React front-end', async () => {
        sinon.stub(Git.prototype, 'clone').callsFake(function (command, callback) {
            callback.call();
        });
        
        assert(await shapeCommand.execute(prepareArgs()));

        sinon.assert.calledWith(processOptionsSpy, prepareArgs());
        sinon.assert.calledWith(processSpy, FRAMEWORK_REACT);
    });

    it('Should shape a dApp with React front-end', async () => {
        sinon.stub(Git.prototype, 'clone').callsFake(function (command, callback) {
            callback.call();
        });
        
        assert(await shapeCommand.execute(prepareArgs()));

        sinon.assert.calledWith(processOptionsSpy, prepareArgs());
        sinon.assert.calledWith(processSpy, FRAMEWORK_REACT);
    });

    it('Should throw when an unknown front-end framework is specified', async () => {
        cloneSpy = sinon.spy(Git.prototype, 'clone');
        
        assert(await shapeCommand.execute(prepareArgs(FRAMEWORK_ANGULAR)));

        sinon.assert.calledWith(processOptionsSpy, prepareArgs(FRAMEWORK_ANGULAR));
        sinon.assert.calledWith(processSpy, FRAMEWORK_ANGULAR);
        sinon.assert.notCalled(cloneSpy);
    });

    it('Should throw when repository cloning fails', async () => {
        sinon.stub(Git.prototype, 'clone').throws('Test Failure');

        assert(await shapeCommand.execute(prepareArgs()));
    });

});