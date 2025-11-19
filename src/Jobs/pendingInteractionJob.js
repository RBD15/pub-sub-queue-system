const { workerData,parentPort } = require('node:worker_threads');

module.exports =  async () => {
  const QueueManager = workerData.QueueManager 
  console.log("Running PendingInteraction Job",workerData);
  await processData(QueueManager)  
};

async function processData(QueueManager){
  await QueueManager.handleNextPendingInteraction()
  if (parentPort) parentPort.postMessage('done');
  // else process.exit(0);
}

 // Export for testing
    module.exports.processData = processData;


