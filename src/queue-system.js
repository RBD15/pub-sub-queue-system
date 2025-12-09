//TODO: QueueManager
// Store EnqueueInteractions
// handleNextPendingInteraction
// AssignAgent To handler older pendingInteractions

const QueueInterface = require("./Queue/Domain/QueueInterface");

class QueueManager {
  
  #enqueueHistory;
  #queueImplementation
  
  constructor(queueImplementation) {
    if (!queueImplementation || !(queueImplementation instanceof QueueInterface)) {   
      throw new Error("QueueInterface implementation is required to create QueueManager");
    }
    this.#enqueueHistory = [];
    this.#queueImplementation = queueImplementation
  }

  async handleNextPendingInteraction(){

    try {      
      if(!this.isPendingInteractions())
        return;
        
      for (let index = 0; index < this.#enqueueHistory.length; index++) {

        const interaction = this.#enqueueHistory[index]
        const queueId = interaction.queueId
        const agent = await this.#queueImplementation.assignAgent(interaction.idOperation, queueId)
        
        if(!agent){
          return
        }
        //Clean pending interaction
        this.#enqueueHistory.splice(index, 1);

        return agent
      }
    } catch (error) {
      return
    }
  }

  isPendingInteractions(){
    return this.#enqueueHistory.length > 0
  }

  enqueue(idOperation,queueId, value, dateTimestamp='' ) {
    let timestamp
    // if (!this.#queues.has(queueId)) {
    //   throw new Error(`La cola ${queueId} no existe.`);
    // }
        
    if(dateTimestamp){
      timestamp = new Date(dateTimestamp)
    }else{
      timestamp = new Date()
    }

    // Registrar en historial
    this.#enqueueHistory.push({
      idOperation,
      value,
      timestamp,
      queueId
    });    
  }

  // dequeueFromSelectedQueues(queueIds,all=false) {
  //   let candidates = [];

  //   if(!all){
  //     for (const id of queueIds) {
  //       const queue = this.#queues.get(id);
  //       if (queue && queue.getItems().length > 0) {
  //         candidates.push({ item: queue.getItems()[0], queueId: id });
  //       }
  //     }
  //     // console.log("Candidates Disorder",candidates);
  //     if (candidates.length === 0) return null;

  //   }else{
  //     this.#queues.forEach((queue,id)=>{
  //       candidates.push({ item: queue.getItems()[0], queueId: id }) 
  //     })
  //     return candidates
  //   }

  //   // Ordenar por prioridad descendente, luego por antigüedad
  //   candidates.sort((a, b) => {
  //     // if (b.item.priority !== a.item.priority) {
  //     //   return b.item.priority - a.item.priority;
  //     // }
  //     //Modifiy to timestamp to improve times evaluating 
  //     const timeA = new Date(a.item.timestamp).getTime();
  //     const timeB = new Date(b.item.timestamp).getTime();
  //     return timeA - timeB;
  //   });    
  //   const { item, queueId } = candidates[0];
  //   const queueFounded = this.#queues.get(queueId); // Eliminar el elemento
  //   queueFounded.shiftLastItem()

  //   this.#enqueueHistory = this.#enqueueHistory.filter(
  //     entry => !(entry.value === item.value && entry.timestamp.getTime() === new Date(item.timestamp).getTime() && entry.queueId === queueId)
  //   );

  //   // Publish event on dequeue
  //   // this.#eventManager.emit(
  //   //   new DequeueEvent('QUEUE_DEQUEUED',{data: { queueId, item }})
  //   // );

  //   return { ...item, fromQueue: queueId };
  // }

  getEnqueueHistory() {
    return this.#enqueueHistory;
  }

  removeInteractionFromHistory(value) {
    const originalLength = this.#enqueueHistory.length;
    this.#enqueueHistory = this.#enqueueHistory.filter(entry => entry.value !== value);
    const removedCount = originalLength - this.#enqueueHistory.length;
  }

  async getAgentByQueue(operationId,queueId){
    return await this.#queueImplementation.getAgents(operationId,queueId)
  }

  // retryElement(queueId) {
  //   const queue = this.#queues.get(queueId);
  //   if (queue && queue.getItems().length > 0) {
  //     queue.getItems()[0].retries += 1;
  //   }
  // }

  // printQueues() {
  //   for (const [id, queue] of this.#queues.entries()) {
  //     queue.getItems().forEach((item, index) => {
  //       console.log(`  [${index}] ${item.value} | reintentos: ${item.retries} | fecha: ${item.timestamp.toISOString()}`);
  //     });
  //   }
  // }

  async cleanQueues(){
    this.#enqueueHistory = []
    await this.#queueImplementation.clean()
  }

}

module.exports = { QueueManager };
