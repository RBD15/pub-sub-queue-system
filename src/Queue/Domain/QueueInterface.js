class QueueInterface {
  constructor() {
    if (this.constructor === QueueInterface) {
      throw new Error("No puedes instanciar una interfaz directamente");
    }
    if (typeof this.logoutAgent !== "function") {
      throw new Error("La clase debe implementar el método logoutAgent()");
    }
    if (typeof this.loggingAgent !== "function") {
      throw new Error("La clase debe implementar el método loggingAgent()");
    }
    if (typeof this.assignAgent !== "function") {
      throw new Error("La clase debe implementar el método assignAgent()");
    }
    if (typeof this.getAgents !== "function") {
      throw new Error("La clase debe implementar el método getAgents()");
    }
    if (typeof this.setAgent !== "function") {
      throw new Error("La clase debe implementar el método setAgent()");
    }
    if (typeof this.isQueueEmpty !== "function") {
      throw new Error("La clase debe implementar el método isQueueEmpty()");
    }
    if (typeof this.cleanAgentInteractions !== "function") {
      throw new Error("La clase debe implementar el método cleanAgentInteractions()");
    }
    if (typeof this.removeAgents !== "function") {
      throw new Error("La clase debe implementar el método removeAgents()");
    }
    if (typeof this.incrementInteractions !== "function") {
      throw new Error("La clase debe implementar el método incrementInteractions()");
    }
    if (typeof this.clean !== "function") {
      throw new Error("La clase debe implementar el método clean()");
    }
  }

}

module.exports = QueueInterface