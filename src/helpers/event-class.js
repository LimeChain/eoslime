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
        for (let i = 0; i < this.eventsHooks[EVENTS[eventName]].length; i++) {
            this.eventsHooks[EVENTS[eventName]][i](...params);
        }
    }
}

module.exports = EventClass;
