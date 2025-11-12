const { workerData,parentPort } = require('node:worker_threads');

module.exports =  async () => {
  const multiQueue = workerData.multiQueue 
  console.log("Running PendingInteraction Job",workerData);
  await processData(multiQueue)  
};

async function processData(multiQueue){
  await multiQueue.handleNextPendingInteraction()
  if (parentPort) parentPort.postMessage('done');
  // else process.exit(0);
}

 // Export for testing
    module.exports.processData = processData;


