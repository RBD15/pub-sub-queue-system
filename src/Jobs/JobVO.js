class JobVO {
    #name
    #interval
    #timeout
    #jobFileName
    #payload
    constructor(name,jobFileName,payload,interval=null,timeout=null) {
        this.#name=name
        this.#interval=interval
        this.#timeout=timeout
        this.#jobFileName=jobFileName
        this.#payload=payload
    }

    getName(){
        return this.#name
    }

    getInterval(){
        return this.#interval
    }

    getTimeout(){
        return this.#timeout
    }

    getJobFileName(){
        return this.#jobFileName
    }

    getPayload(){
        return this.#payload
    }
}

module.exports = JobVO