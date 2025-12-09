const QueueInterface = require("../Domain/QueueInterface")
const realtimeQueue = require("../../Service/realtimeQueue")

class QueueImplementation extends QueueInterface {
  
  constructor(){
    super()
  }

  async incrementInteractions(queueId,agentId) {
    await realtimeQueue.updateInteractions(queueId,agentId)
  }

  async removeAgents(){
    await realtimeQueue.removeAgents()
  }

  async cleanAgentInteractions(agentId) {
    await realtimeQueue.cleanAgentInteractions(agentId)
  }

  async loggingAgent(agent,queueId) {
    await realtimeQueue.loggingAgent(agent,queueId)
  }

  async logoutAgent(agent,queueId) {
    await realtimeQueue.logoutAgent(agent,queueId)
  }

  async clean(){
    await realtimeQueue.cleanAlls()
  }

  async assignAgent(idOperation,queueId){

    currentQueue = await realtimeQueue.getQueueById(queueId)
    if(!currentQueue)
      return;
    
    let candidates = []

    candidates = await realtimeQueue.getAvailableAgents(idOperation,queueId)
    if (candidates.length === 0) return null
    //Algorithm
    candidates.sort((a, b) => a.interactions - b.interactions) 
    const candidate = candidates.shift()

    await this.incrementInteractions(queueId,candidate._id)
    return candidate
  }

  async getAgents(operationId,queueId){
    return await realtimeQueue.getAvailableAgents(operationId,queueId)
  }

  async setAgent(newAgent){
    await realtimeQueue.storeAgentInQueues(newAgent)
  }

  async isQueueEmpty(idOperation,queueId){
    const agents = await realtimeQueue.getAvailableAgents(idOperation, queueId)
    return Array.isArray(agents) ? agents.length === 0 : true
  }

}

module.exports = QueueImplementation