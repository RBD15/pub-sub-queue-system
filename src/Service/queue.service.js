
class QueueService{

  #queues
  constructor(){
    this.#queues = [];
  }

    async getAllByOperation(idOperation){
        let findParams = {idOperation: idOperation}
        const allQueues = this.#queues.filter((queue) => queue.idOperation == findParams.idOperation)
        return allQueues;
    }

    async getQueuesWithAgents(idOperation) {
        try {
            let findParams = {
                idOperation: idOperation
            }
            const allQueues = this.#queues.filter((queue) => queue.idOperation == findParams.idOperation)
            return allQueues;
        } catch (error) {
            console.error('Error al obtener las queues:', error);
            throw error;
        }
    }

    async getQueueWithAvailableAgents(idOperation,queueID) {
        try {
            let findParams = {
                idOperation: idOperation,
                queueID:queueID
            }
            const queueWithAvailableAgents = this.#queues.filter((queue) => queue.idOperation == findParams.idOperation && queue.id == findParams.queueID && queue.agents.some(agent => agent.online == true) )
            const availableAgents = queueWithAvailableAgents.map(queue => ({
                ...queue,
                agents: queue.agents.filter(agent => agent.online === true)
            }))
            return availableAgents[0].agents;
        } catch (error) {
            console.error('Error al obtener las queues:', error);
            throw error;
        }
    }

  // async getAll(idQueue){
  //   const allQueues = await this.#queue.find({idQueue:idQueue})
  //   return allQueues;
  // }
  
    async getQueueById(uid){
        const queue = this.#queues.filter((queue) => queue.id == uid )
        if(!queue || queue.length == 0){
            throw new Error('Queue id didnt find');
        }
        return queue
    }

    async create(queue){
        const newQueue = this.#queues.push(queue);
        return newQueue
    }

}

const queueService = new QueueService()
module.exports = queueService