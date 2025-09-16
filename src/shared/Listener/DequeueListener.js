class DequeueListener{
  #eventHandler
  
  constructor(eventHandler){
    this.#eventHandler = eventHandler
    this.handle = async (event) => {
      console.log(`\n✅ ITEM DEQUEUED:`);
      console.log(`   Queue: ${event.getContent().data.queueId}`);
      console.log(`   Value: ${event.getContent().data.item.value}`);
      console.log(`   Priority: ${event.getContent().data.item.priority}`);
      console.log(`   Retries: ${event.getContent().data.item.retries}`);
    }
  }

}

module.exports = DequeueListener;