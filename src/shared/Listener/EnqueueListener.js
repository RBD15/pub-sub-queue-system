class EnqueueListener{
  #eventHandler
  
  constructor(eventHandler){
    this.#eventHandler = eventHandler
    this.handle = async (event) => {
        console.log(`\n🔔 ITEM ENQUEUED:`);
        console.log(`   Queue: ${event.getContent().data.queueId}`);
        console.log(`   Value: ${event.getContent().data.item.value}`);
        console.log(`   Priority: ${event.getContent().data.item.priority}`);
        console.log(`   Timestamp: ${event.getContent().data.item.timestamp.toISOString()}`);
    }
  }

}

module.exports = EnqueueListener;