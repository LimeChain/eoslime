module.exports = {
    defineImmutableProperties: function (object, properties) {
        for (let i = 0; i < properties.length; i++) {
            Object.defineProperty(object, properties[i].name, {
                value: properties[i].value,
                writable: false
            });
        }
    }
}