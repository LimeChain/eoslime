module.exports = function (context, queries) {
    if (queries) {
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            const prototype = Object.getPrototypeOf(query);
            const propertyNames = Object.getOwnPropertyNames(prototype);

            for (let i = 0; i < propertyNames.length; i++) {
                if (propertyNames[i] !== 'constructor') {
                    context[propertyNames[i]] = query[propertyNames[i]].bind(query);
                }
            }
        }

        return context;
    }
}