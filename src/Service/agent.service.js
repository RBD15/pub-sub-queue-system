// const { default: mongoose } = require("mongoose");
// const agent = require("../models/agent")

class AgentService{

  #agent
  constructor(){
    this.#agent = [
        {
            "_id": "642ce03160c06a843dfce0f2",
            "name": "Rober",
            "email": "r@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        },
        {
            "_id": "600ce03161c06a843dfce0f2",
            "name": "Prueba",
            "email": "test@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": false
        }
    ];
  }

  get(idOperation,availableOnly = false){
    let findParams = {idOperation: idOperation}
    if(availableOnly){
      findParams.online = true
    }    
    const allAgents = this.#agent.filter((agent) => agent.idOperation == findParams.idOperation && agent.online == findParams.online)
    return allAgents;
  }

  async getAgentsByOperationAndQueue(idOperation,idQueue,availableOnly = false) {     
    try {
      let match = {
        idQueue:new mongoose.Types.ObjectId(idQueue),
        idOperation: idOperation
      }
      if(availableOnly){
        match.online = true
      }

      const result = await this.#agent.aggregate([
        {
          $match: match
        },
        {
          $lookup: {
              from: 'queues', // nombre de la colección en MongoDB
              localField: 'idQueue',
              foreignField: '_id',
              as: 'CurrentQueues'
          }
        }
      ]);

      return result;
    } catch (error) {
      console.error('Error al obtener los agentes:', error);
      throw error;
    }
  }

  async getAll(idQueue,availableOnly = false){
    let findParams = {idQueue:idQueue}
    if(availableOnly){
      findParams.online = true
    }
    const allAgents = this.#agent.filter(agent => agent.online && agent.idQueue.some(queue => queue._id === findParams.idQueue)  );
    return allAgents;
  }
  
  async getAgentById(uid){
    const agent = this.#agent.filter(agent => agent._id === uid );

    if(!agent || agent.length == 0){
      throw new Error('Agent id didnt find');
    }
    return agent
  }

  async getAgentByEmail(email){
    const agent = this.#agent.filter(agent => agent.email === email );
    if(!agent || agent.length == 0){
      throw new Error('Agent email didnt find');
    }
    return agent[0]
  }

  async create(agent){
    this.#agent.push(agent)
    return newAgent
  }


}
const agentService = new AgentService()
module.exports = agentService