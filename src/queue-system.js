const EventManager = require("./Shared/Domain/EventManager");
const EnqueueEvent = require("./shared/Event/EnqueueEvent");
const DequeueEvent = require("./shared/Event/DequeueEvent");

class MultiQueue {
  #queues;

  constructor() {
    this.#queues = new Map();
  }

  createQueue(queue) {
    const queueId = queue.getId()
    if (!this.#queues.has(queueId)) {
      this.#queues.set(queueId, queue);
    }
  }

  enqueue(queueId, value, dateTimestamp='' ) {
    let timestamp
    if (!this.#queues.has(queueId)) {
      throw new Error(`La cola "${queueId}" no existe.`);
    }
        
    if(dateTimestamp){
      timestamp = dateTimestamp
    }else{
      timestamp = new Date()
    }
    const item = { value, timestamp , retries: 0 };
    const queue = this.#queues.get(queueId)
    queue.setItems(item)

    // Publish event on enqueue
    eventManager.emit(
      new EnqueueEvent('QUEUE_ENQUEUED',{data: { queueId, item }})
    );
  }

  dequeueFromSelectedQueues(queueIds) {
    let candidates = [];

    for (const id of queueIds) {
      const queue = this.#queues.get(id);
      if (queue && queue.getItems().length > 0) {
        candidates.push({ item: queue.getItems()[0], queueId: id });
      }
    }
    // console.log("Candidates Disorder",candidates);
    if (candidates.length === 0) return null;

    // Ordenar por prioridad descendente, luego por antigüedad
    candidates.sort((a, b) => {
      // if (b.item.priority !== a.item.priority) {
      //   return b.item.priority - a.item.priority;
      // }
      const timeA = new Date(a.item.timestamp).getTime();
      const timeB = new Date(b.item.timestamp).getTime();
      return timeA - timeB;
    });    
    const { item, queueId } = candidates[0];
    const queueFounded = this.#queues.get(queueId); // Eliminar el elemento
    queueFounded.shiftLastItem()
    
    // Publish event on dequeue
    eventManager.emit(
      new DequeueEvent('QUEUE_DEQUEUED',{data: { queueId, item }})
    );

    return { ...item, fromQueue: queueId };
  }

  retryElement(queueId) {
    const queue = this.#queues.get(queueId);
    if (queue && queue.getItems().length > 0) {
      queue.getItems()[0].retries += 1;
    }
  }

  printQueues() {
    for (const [id, queue] of this.#queues.entries()) {
      console.log(`Cola "${id}":`);
      queue.getItems().forEach((item, index) => {
        console.log(`  [${index}] ${item.value} | reintentos: ${item.retries} | fecha: ${item.timestamp.toISOString()}`);
      });
    }
  }

  cleanQueues(){
    this.#queues = new Map()
  }

  getQueues(){
    return this.#queues
  }
}

// Singleton EventManager
const eventManager = new EventManager();

module.exports = { MultiQueue, eventManager };
