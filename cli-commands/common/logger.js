const logger = {
    info: (message) => {
        console.log(message);
    },
    error: (message, error) => {
        console.log(message);
        console.log(error);
    }
}

module.exports = logger;