const queueService = require("../../Service/queue.service")

class Queue {
  
  #id
  #name
  #operation
  #agents
  #lastIndex
  #interactions

  constructor(id,name){
    this.#id = id
    this.#name = name || id
    this.#operation = '1234'
    this.#interactions = []
    this.#agents = new Map()
  }

  async handleInteractions(){
    // const agents = await queueService.getQueueWithAvailableAgents(this.#operation,this.#id)
    if (this.#agents.length === 0) return null;

    const agentAssign = this.assignAgent()
    if(!agentAssign) return;

    return agentAssign
  }

  incrementInteractions(agentId) {
    if (this.#agents.has(agentId)) {
      this.#agents.get(agentId).interactions++;
    }
  }

  removeAgents(){
    this.#agents = new Map()
  }

  cleanAgentInteractions() {
    for (const [key, value] of this.#agents.entries()) {
      if (value.interactions > 0)
        value.interactions = 0;
    }
  }

  assignAgent(){
    let candidates = []

    candidates = [...this.#agents.values()].filter(a => a.online)
    if (candidates.length === 0) return null

    candidates.sort((a, b) => a.interactions - b.interactions) 
    const candidate = candidates.shift()

    this.incrementInteractions(candidate._id)
    return candidate
  }

  async getAllAgents(){
    const agents = await queueService.getQueueWithAvailableAgents(this.#operation,this.#id)
    return agents
  }

  getAgents(){
    return [...this.#agents.values()].filter(a => a.online)
  }

  setAgent(newAgent){
    newAgent.interactions = 0
    this.#agents.set(newAgent._id,newAgent)
    // return newAgent
  }
   
  updateAgent(removeAgent){
    const agent = this.#agents.get(removeAgent._id)
    agent.online = false
    this.#agents.set(agent._id,agent)
  }

  isEmpty(){
    return this.#agents.length == 0
  }

  getId(){
    return this.#id
  }

  setItems(interaction){
    this.#interactions.push(interaction)
  }

  getItems(){
    return this.#interactions
  }

  shiftLastItem(){
    this.#interactions.shift()
  }

}

module.exports = Queue