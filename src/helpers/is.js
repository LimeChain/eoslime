module.exports = function (data) {
    return {
        instanceOf: function (ofObject) {
            if (!(data instanceof ofObject)) {
                throw new Error(`Provided ${data.constructor.name} is not an instance of ${ofObject.name}`);
            }
        }
    }
}