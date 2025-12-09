
class QueueService{

  #queues
  #agents
  constructor(){
    this.#queues = new Map();
    this.#agents = new Map();
  }

  //Modify this.#queues from array to map
    async getAllQueuesByOperation(idOperation){        
        try {
            let findParams = {
                idOperation: idOperation
            }
            const allQueues = [...this.#queues.values()].filter((queue) => queue.operation == findParams.idOperation)
            return allQueues;
        } catch (error) {
            throw error;
        }
    }

    async getQueuesWithAgents(idOperation) {
        try {
            const findParams = {
                idOperation
            };
            const queues = [...this.#queues.values()].filter(
                queue => queue.operation == findParams.idOperation
            );
            return queues;
        } catch (error) {
            throw error;
        }
    }

    async getQueueWithAvailableAgents(idOperation, queueID) {
        try {
            const findParams = {
                idOperation,
                queueID
            };
            const queues = [...this.#queues.values()].filter(
                queue => queue.operation == findParams.idOperation &&
                    queue.id == findParams.queueID 
            );
            const availableQueues = queues.map(queue => ({
                ...queue,
                agents: queue.agents.filter(agent => agent.online == true)
            }));
            return availableQueues;
        } catch (error) {
            throw error;
        }
    }

    async getQueueWithAvailableAgents(idOperation, queueID) {
        try {
            const findParams = {
                idOperation,
                queueID
            };

            const agents = [...this.#queues.values()].filter(
                queue => queue.operation == findParams.idOperation &&
                    queue.id == findParams.queueID 
            );
            
            const availableAgents = agents.map(queue => ({
                ...queue,
                agents: queue.agents.filter(agent => agent.online === true)
            }));

            return availableAgents.length > 0 ? availableAgents[0].agents : [];
        } catch (error) {
            throw error;
        }
    }

    // async getAll(idQueue){
    //   const allQueues = await this.#queue.find({idQueue:idQueue})
    //   return allQueues;
    // }
  
    async getQueueById(uid){       
        if(!this.#queues.has(uid)){
            throw new Error('Queue id didnt find');
        }        
        const queue = this.#queues.get(uid);
        return queue
    }

    async create(queue){
        const queueId = queue.getId()
        if (!this.#queues.has(queueId)) {
            this.#queues.set(queueId, queue.getJson())
        }
    }

    async updateInteractions(queueID,agentId) {    
        const queue = this.#queues.get(queueID);
        if (!queue) {
            throw new Error(`Queue with ID ${queueID} not found`);
        }

        const agent = queue.agents.find(agent => agent._id === agentId);
        if (!agent) {
            throw new Error(`Agent with ID ${agentId} not found in queue ${queueID}`);
        }

        agent.interactions = (agent.interactions || 0) + 1;

        this.#queues.set(queueID, queue);
    }

    async storeAgent(newAgent){
        newAgent.interactions = 0
        for (const idQueue of newAgent.idQueue) {

            if (!this.#queues.has(idQueue._id)) {
                throw new Error("Agent could add queue cause queue doesnt exist")
            }
            const queue = this.#queues.get(idQueue._id)
            queue.agents.push(newAgent._id)
            this.#queues.set(queue.id,queue)
        }
    }
}

const queueService = new QueueService()
module.exports = queueService