class EnqueueEvent{
  #content;
  #eventType;

  constructor(eventType,content){
    this.#content = content;
    this.#eventType = eventType;

    this.getEventType =()=>{
      return this.#eventType;
    }
  
    this.getContent = ()=>{
      return this.#content;
    }
  }

}

module.exports = EnqueueEvent