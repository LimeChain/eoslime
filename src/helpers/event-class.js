class EventClass {
    constructor(events) {
        this.events = events;
        this.eventsHooks = {};
    }

    on(eventName, callback) {
        if (this.events[eventName]) {
            if (!this.eventsHooks[eventName]) {
                this.eventsHooks[eventName] = [];
            }

            this.eventsHooks[eventName].push(callback);
        }
    }

    emit(eventName, ...params) {
        if (this.eventsHooks[eventName]) {
            for (let i = 0; i < this.eventsHooks[eventName].length; i++) {
                this.eventsHooks[eventName][i](...params);
            }
        }
    }
}

module.exports = EventClass;
