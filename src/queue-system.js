const EnqueueEvent = require("./shared/Event/EnqueueEvent");
const DequeueEvent = require("./shared/Event/DequeueEvent");
const Queue = require("./Queue/application/Queue");

class QueueManager {
  #queues;
  #operation;
  #enqueueHistory;
  #eventManager
  #queueService

  constructor(eventManager,queueService) {
    this.#queues = new Map();
    this.#operation = "1234"
    this.#enqueueHistory = [];
    this.#eventManager = eventManager
    this.#queueService = queueService
  }

  async createQueue(queue) { 
    const queueId = queue.getId()
    if (!this.#queues.has(queueId)) {
      this.#queues.set(queueId, queue)
    }
  }

  async handleNextPendingInteraction(){
    let currentQueue,agent
    try {      
      if(!this.isPendingInteractions())
        return;
        
      for (let index = 0; index < this.#enqueueHistory.length; index++) {

        const interaction = this.#enqueueHistory[index]
        const queueId = interaction.queueId
        
        currentQueue = this.#queues.get(queueId)
        if(!currentQueue)
          return;

        agent = currentQueue.assignAgent()

        if(!agent){
          return
        }
        //Clean pending interaction
        this.#enqueueHistory.splice(index, 1);

        return agent
      }
    } catch (error) {
      console.log("QueueSystem",error);
      return
    }
  }

  isPendingInteractions(){
    return this.#enqueueHistory.length > 0
  }

  enqueue(queueId, value, dateTimestamp='' ) {
    let timestamp
    if (!this.#queues.has(queueId)) {
      throw new Error(`La cola ${queueId} no existe.`);
    }
        
    if(dateTimestamp){
      timestamp = new Date(dateTimestamp)
    }else{
      timestamp = new Date()
    }
    const item = { value, timestamp , retries: 0 };
    const queue = this.#queues.get(queueId) 
    queue.setItems(item)

    // Registrar en historial
    this.#enqueueHistory.push({
      value,
      timestamp,
      queueId
    });

    // Publish event on enqueue
    this.#eventManager.emit(
      new EnqueueEvent('QUEUE_ENQUEUED',{data: { queueId, item }})
    );
  }

  dequeueFromSelectedQueues(queueIds,all=false) {
    let candidates = [];

    if(!all){
      for (const id of queueIds) {
        const queue = this.#queues.get(id);
        if (queue && queue.getItems().length > 0) {
          candidates.push({ item: queue.getItems()[0], queueId: id });
        }
      }
      // console.log("Candidates Disorder",candidates);
      if (candidates.length === 0) return null;

    }else{
      this.#queues.forEach((queue,id)=>{
        candidates.push({ item: queue.getItems()[0], queueId: id }) 
      })
      return candidates
    }

    // Ordenar por prioridad descendente, luego por antigüedad
    candidates.sort((a, b) => {
      // if (b.item.priority !== a.item.priority) {
      //   return b.item.priority - a.item.priority;
      // }
      //Modifiy to timestamp to improve times evaluating 
      const timeA = new Date(a.item.timestamp).getTime();
      const timeB = new Date(b.item.timestamp).getTime();
      return timeA - timeB;
    });    
    const { item, queueId } = candidates[0];
    const queueFounded = this.#queues.get(queueId); // Eliminar el elemento
    queueFounded.shiftLastItem()

    this.#enqueueHistory = this.#enqueueHistory.filter(
      entry => !(entry.value === item.value && entry.timestamp.getTime() === new Date(item.timestamp).getTime() && entry.queueId === queueId)
    );

    // Publish event on dequeue
    this.#eventManager.emit(
      new DequeueEvent('QUEUE_DEQUEUED',{data: { queueId, item }})
    );

    return { ...item, fromQueue: queueId };
  }

  getEnqueueHistory() {
    return this.#enqueueHistory;
  }

  removeInteractionFromHistory(value) {
    const originalLength = this.#enqueueHistory.length;
    this.#enqueueHistory = this.#enqueueHistory.filter(entry => entry.value !== value);
    const removedCount = originalLength - this.#enqueueHistory.length;
  }

  async agentLogged(queuesID, agent) {
    for (const queueID of queuesID) {
      let queueInstance;
      if (this.#queues.has(queueID)) {
        queueInstance = this.#queues.get(queueID);
      } else {
        const queue = await this.#queueService.getQueueById(queueID);
        if (!queue) {
          throw new Error("Agent Logged, Queue wasn't found");
        }
        queueInstance = new Queue(queue._id, queue.name);
        this.#queues.set(queueID, queueInstance);
      }
      queueInstance.setAgent({ ...agent });
    }
  }

  //V2 run parallel calls
  // async agentLogged(queuesID, agent) {
  //   const queuePromises = queuesID.map(async (queueID) => {
  //     let queueInstance;

  //     if (this.#queues.has(queueID)) {
  //       queueInstance = this.#queues.get(queueID);
  //     } else {
  //       const queue = await this.#queueService.getQueueById(queueID);
  //       if (!queue) {
  //         throw new Error("Agent Logged, Queue wasn't found");
  //       }
  //       queueInstance = new Queue(queue._id, queue.name);
  //       this.#queues.set(queueID, queueInstance);
  //     }

  //     queueInstance.setAgent({ ...agent });
  //   });

  //   await Promise.all(queuePromises);
  // }


  async agentLogout(queuesID,agent){
    for (const queueID of queuesID) {
      let queueInstance
      if(this.#queues.has(queueID)){
        queueInstance = this.#queues.get(queueID)
      }else{
        const queue = await this.#queueService.getQueueById(queueID)
        if(!queue)
          throw new Error("Agent Logout, Queue wasnt founded")
        queueInstance = new Queue(queue._id,queue.name)
        this.#queues.set(queueID,queueInstance)
      }
      queueInstance.updateAgent({...agent})
    }
  }

  getAgentByQueue(queueId){
    return this.#queues.get(queueId).getAgents()
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
    this.#enqueueHistory = []
  }

  getQueues(){
    return this.#queues
  }
}

module.exports = { QueueManager };
