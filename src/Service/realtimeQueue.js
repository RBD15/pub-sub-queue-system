const queueService = require('./queue.service')
const agentService = require('./agent.service')

/**
 * Singleton that combines QueueService and AgentService methods.
 * Most methods are proxied to the underlying services. The
 * `updateInteractions` method updates both the agent and the queue
 * when a single interaction occurs.
 */

class RealtimeQueue {
  
    #queues // {id:1234,agents:[{id:5678,online:true,interactions:0}],interactions:0}
  constructor() {
    this.#queues = new Map();
    this.queue = queueService
    this.agent = agentService
  }

  // --------- Queue service proxies ---------
  async getAllByOperation(idOperation) {
    return this.queue.getAllByOperation(idOperation)
  }

  async getQueuesWithAgents(idOperation) {
    return this.queue.getQueuesWithAgents(idOperation)
  }

  async getAvailableAgents(idOperation, queueID) {
    let queueFounded
    try {
        const findParams = {
            idOperation,
            queueID
        };

        queueFounded = await queueService.getQueueById(queueID)
        if(!queueFounded)
            throw new Error("Agent couldnt be added queue cause queue doesnt exist")

        if (!this.#queues.has(queueID)) {
            this.#queues.set(queueID,{id:queueID,operation:idOperation,agents:[]})
            return [];
        }

        queueFounded = [...this.#queues.values()].filter(
            queue => queue.operation == findParams.idOperation &&
            queue.id == findParams.queueID
        );
        if(!queueFounded || queueFounded.length === 0 || queueFounded[0].agents.length === 0) return []
        const agents = [...queueFounded[0].agents]
        
        const availableAgents = await this.getOnlineAgents(agents)        
        return availableAgents.length > 0 ? agents : [];

    } catch (error) {
        return [];
        // throw error;
    }
 }

 async getOnlineAgents(agents) {
    const validAgents = []
    for (const agent of agents) {
        const isValidAgent = await agentService.isOnline(agent._id)
        if(isValidAgent){
            validAgents.push(agent)
        }
    }
    return validAgents
 }

  async getQueueById(uid) {
    return this.queue.getQueueById(uid)
  }

  async cleanAlls() {
    this.#queues = new Map();
  }

  async cleanAgentInteractions(agentId) {
    for (const [key, queue] of this.#queues.entries()) {
      const agent = queue.agents.find(a => a._id === agentId)
      if (agent && agent.interactions > 0) {
        agent.interactions = 0;
      }
    }   
  }

  async removeAgents() {
    for (const [key, queue] of this.#queues.entries()) {
      queue.agents = [];
    }   
  }

  async storeAgentInQueues(newAgent) {
        newAgent.interactions = 0
        for (const idQueue of newAgent.idQueue) {

            const queueFounded = await queueService.getQueueById(idQueue._id)
            if(!queueFounded)
                throw new Error("Agent couldnt be added queue cause queue doesnt exist")

            if (!this.#queues.has(idQueue._id)) {
                this.#queues.set(idQueue._id,{id:idQueue._id,operation:newAgent.idOperation,agents:[]})
            }

            const queue = this.#queues.get(idQueue._id)
            const agent = { ...newAgent }
            queue.agents.push(agent)
            this.#queues.set(queue.id,queue)            
        }
  }

  async updateQueueInteractions(queueID, agentId) {
    return this.queue.updateInteractions(queueID, agentId)
  }

  async getAgentsByOperation(idOperation, availableOnly = false) {
    return this.agent.get(idOperation, availableOnly)
  }

  async getAgentsByOperationAndQueue(idOperation, idQueue, availableOnly = false) {
    return this.agent.getAgentsByOperationAndQueue(idOperation, idQueue, availableOnly)
  }

  async getAllAgents(idQueue, availableOnly = false) {
    return this.agent.getAll(idQueue, availableOnly)
  }

  async getAgentById(uid) {
    return this.agent.getAgentById(uid)
  }

  async getAgentByEmail(email) {
    return this.agent.getAgentByEmail(email)
  }

  async createAgent(agent) {
    return this.agent.create(agent)
  }

  async loggingAgent(agent,queueId) {
    agent.interactions = 0

    const queueFounded = await queueService.getQueueById(queueId)
    if(!queueFounded)
        throw new Error("Agent couldnt be added queue cause queue doesnt exist")
    
    const agentFounded = await agentService.getAgentById(agent._id)
    if(!agentFounded)
        throw new Error("Agent couldnt be added queue cause agent doesnt exist")
    
    if (!this.#queues.has(queueId)) {
        this.#queues.set(queueId,{id:queueId,operation:agent.idOperation,agents:[]})
    }
    
    const queue = this.#queues.get(queueId)
    const newAgent = { ...agent }
    queue.agents.push(newAgent)
    this.#queues.set(queue.id,queue)
    
  }

  async logoutAgent(agent,queueId) {
    const queueFounded = await queueService.getQueueById(queueId)
    if(!queueFounded)
        throw new Error("Agent couldnt be logout queue cause queue doesnt exist")

    const queue = this.#queues.get(queueId)
    const agents = queue.agents.filter(a => a._id !== agent._id)
    queue.agents = agents
    this.#queues.set(queue.id,queue)
  }

  async updateAgentInteractions(agentId) {
    return this.agent.updateInteractions(agentId)
  }

  /**
   * Combined method: when an interaction happens, update both
   * the agent and the queue counters. If `queueID` is provided the
   * queue will be updated as well; otherwise only the agent is updated.
   *
   * @param {string} agentId
   * @param {string} [queueID]
   */
  async updateInteractions(queueID,agentId) {
    if (!this.#queues.has(queueID)) {
      throw new Error(`Queue with ID ${queueID} not found in realtimeQueue`)
    }

    const queue = this.#queues.get(queueID)
    const agent = queue.agents.find(a => a._id === agentId)
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found in queue ${queueID}`)
    }

    // increment in local cache
    agent.interactions++
    this.#queues.set(queueID, queue)
  }

}

const realtimeQueue = new RealtimeQueue()
module.exports = realtimeQueue
