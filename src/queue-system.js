const EventManager = require("./shared/Domain/EventManager");

class MultiQueue {
  #queues;

  constructor() {
    this.#queues = new Map();
  }

  createQueue(id) {
    if (!this.#queues.has(id)) {
      this.#queues.set(id, []);
    }
  }

  enqueue(queueId, value, priority = 0) {
    if (!this.#queues.has(queueId)) {
      throw new Error(`La cola "${queueId}" no existe.`);
    }

    const timestamp = new Date();
    const item = { value, timestamp, priority, retries: 0 };
    this.#queues.get(queueId).push(item);

    // Publish event on enqueue
    eventManager.emit({
      getEventType: () => 'QUEUE_ENQUEUED',
      data: { queueId, item }
    });
  }

  dequeueFromSelectedQueues(queueIds) {
    let candidates = [];

    for (const id of queueIds) {
      const queue = this.#queues.get(id);
      if (queue && queue.length > 0) {
        candidates.push({ item: queue[0], queueId: id });
      }
    }

    if (candidates.length === 0) return null;

    // Ordenar por prioridad descendente, luego por antigüedad
    candidates.sort((a, b) => {
      if (b.item.priority !== a.item.priority) {
        return b.item.priority - a.item.priority;
      }
      return a.item.timestamp - b.item.timestamp;
    });

    const { item, queueId } = candidates[0];
    this.#queues.get(queueId).shift(); // Eliminar el elemento

    // Publish event on dequeue
    eventManager.emit({
      getEventType: () => 'QUEUE_DEQUEUED',
      data: { queueId, item }
    });

    return { ...item, fromQueue: queueId };
  }

  retryElement(queueId) {
    const queue = this.#queues.get(queueId);
    if (queue && queue.length > 0) {
      queue[0].retries += 1;
    }
  }

  printQueues() {
    for (const [id, queue] of this.#queues.entries()) {
      console.log(`Cola "${id}":`);
      queue.forEach((item, index) => {
        console.log(`  [${index}] ${item.value} | prioridad: ${item.priority} | reintentos: ${item.retries} | fecha: ${item.timestamp.toISOString()}`);
      });
    }
  }
}

// Singleton EventManager
const eventManager = new EventManager();

module.exports = { MultiQueue, eventManager };
