module.exports = function (data) {
    return {
        instanceOf: function (ofObject) {
            if (data == null || data == undefined) {
                throw new Error(`Not an instance of ${ofObject.name}`);
            }

            if (!(data instanceof ofObject)) {
                throw new Error(`Provided ${data.constructor.name} is not an instance of ${ofObject.name}`);
            }
        }
    }
}