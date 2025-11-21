class EnqueueInteraction {
    #id
    #value
    #timestamp
    constructor(id,value,timestamp) {
        this.#id = id
        this.#value = value
        this.#timestamp = timestamp
    }

    toJson(){
        return {
            id:this.#id,
            value: this.#value,
            timestamp: this.#timestamp
        }
    }
}

module.exports = EnqueueInteraction