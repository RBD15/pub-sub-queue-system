const AgentStatus = require("../Event/AgentStatus");

class AgentUpdateStatusListener {

  #eventHandler
  constructor(eventHandler){
    this.#eventHandler = eventHandler
  }

  async handle(event){
    if(event.getStatus().toString()==AgentStatus.LOGIN.toString()){
      await this.#eventHandler.agentLogged(event.queueID,event.agent);
    }else if(event.getStatus().toString()==AgentStatus.LOGOUT.toString()){
      await this.#eventHandler.agentLogout(event.queueID,event.agent);
    }else{
      throw new Error('AgentStatus not valid')
    }
  }
  
}

module.exports = AgentUpdateStatusListener