class Queue {
    
    #id
    #name
    #operation
    #agents
    constructor(id,name,idOperation) {
        this.#id = id
        this.#name = name || id
        this.#operation = idOperation
        this.#agents = []
    }

    setAgentsJson(agentsJson){
        this.#agents = agentsJson
    }

    getAgents(){
        return this.#agents
    }

    getJson(){
        return {
            id: this.#id,
            name: this.#name,
            operation: this.#operation,
            agents: this.#agents
        }
    }

    getId(){
        return this.#id
    }

    getName(){
        return this.#name
    }


}

module.exports = Queue