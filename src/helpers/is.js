module.exports = function (data) {
    return {
        instanceOf: function (ofObject) {
            if (data == null || data == undefined) {
                throw new Error(`Not an instance of ${ofObject}`);
            }

            recursivelyCheckIfInstance(data, ofObject);
        }
    }
}

const recursivelyCheckIfInstance = function (candidate, requiredInstance) {
    if (Object.getPrototypeOf(candidate) == null) {
        return false;
    }

    if (candidate.constructor.name != requiredInstance) {
        const isInstance = recursivelyCheckIfInstance(Object.getPrototypeOf(candidate), requiredInstance);
        if (!isInstance) {
            throw new Error(`Provided ${candidate.constructor.name} is not an instance of ${requiredInstance}`);
        }
    }

    return true;
}