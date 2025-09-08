const EventBus = require("./EventBus");

class EventManager {
  #eventBus;

  constructor() {
    this.#eventBus = new EventBus();

    this.subscribe = (eventType, eventHandler) => {
      this.#eventBus.subscribe(eventType, eventHandler);
    };

    this.emit = (event) => {
      this.#eventBus.publish(event);
    };
  }
}

module.exports = EventManager