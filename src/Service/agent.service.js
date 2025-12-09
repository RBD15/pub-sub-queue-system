
class AgentService{

  #agents
  constructor(){
    this.#agents = new Map();
  }

  async get(idOperation,availableOnly = false){
    let findParams = {idOperation: idOperation}
    if(availableOnly){
      findParams.online = true
    }    
    const allAgents =  Array.from(this.#agents.values()).filter((agent) => agent.idOperation == findParams.idOperation && agent.online == findParams.online)
    return allAgents;
  }

  async getAgentsByOperationAndQueue(idOperation,idQueue,availableOnly = false) {     
    try {
      let findParams = {
        idQueue:idQueue,
        idOperation: idOperation
      }
      if(availableOnly){
        findParams.online = true
      }
      const allAgents =  Array.from(this.#agents.values())
      .filter((agent) =>
        agent.idOperation == findParams.idOperation && agent.online == findParams.online && agent.idQueue.some(queue => queue._id === findParams.idQueue._id))      

      return allAgents;

    } catch (error) {
      throw error;
    }
  }

  async getAll(idQueue,availableOnly = false){
    let findParams = {idQueue:idQueue}
    if(availableOnly){
      findParams.online = true
    }
    
    const allAgents = Array.from(this.#agents.values())
      .filter(agent => 
        agent.online && agent.idQueue.some(queue =>queue._id === findParams.idQueue._id)
      );
    return allAgents;
  }
  
  async getAgentById(uid){
    const agent = this.#agents.get(uid);

    if(!agent || agent.length == 0){
      throw new Error('Agent id didnt find');
    }
    return agent
  }

  async getAgentByEmail(email){
    const agent = Array.from(this.#agents.values()).filter(agent => agent.email === email );
    if(!agent || agent.length == 0){
      throw new Error('Agent email didnt find');
    }
    return agent[0]
  }

  async updateInteractions(agentId) {    
    if (this.#agents.has(agentId)) {
      this.#agents.get(agentId).interactions++;
    }
  }

  async isOnline(agentId){
    if (this.#agents.has(agentId)) {
      return this.#agents.get(agentId).online == true
    }
    return false
  }

  async create(agent){
    agent.interactions = 0
    this.#agents.set(agent._id,agent)
    return agent
  }

  async updateAgentStatus(agentId,onlineStatus){
    if (this.#agents.has(agentId)) {
      this.#agents.get(agentId).online = onlineStatus;
    }
  }

}
const agentService = new AgentService()
module.exports = agentService