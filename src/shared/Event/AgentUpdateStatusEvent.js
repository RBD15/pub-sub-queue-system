class AgentUpdateStatusEvent {

  #queueID
  #agent
  #status
  #eventType

  constructor(queueID,agent,status,eventType) {
    this.queueID = queueID;
    this.agent = agent;
    this.#status = status;
    this.#eventType = eventType

    this.getEventType = () => {
      return this.#eventType;
    }
  
    this.getQueueID = () => {
      return this.#queueID
    }
  
    this.getAgent = () => {
      return this.#agent
    }
  
    this.getStatus = () => {
      return this.#status
    }
  }


}

module.exports = AgentUpdateStatusEvent