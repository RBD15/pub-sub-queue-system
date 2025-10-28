const { MultiQueue, eventManager } = require('./queue-system');
const Queue = require('./Queue/application/Queue');
const DequeueListener = require('./Shared/Listener/DequeueListener');
const EnqueueListener = require('./Shared/Listener/EnqueueListener');

// Create the queue system
const queueSystem = new MultiQueue();

// Subscribe to events for logging
eventManager.subscribe('QUEUE_ENQUEUED', new EnqueueListener());
eventManager.subscribe('QUEUE_DEQUEUED',new DequeueListener());

// Create some queues
console.log("🔧 Creating queues...");
let queue
queue = new Queue('1000','SAC')
queueSystem.createQueue(queue);
queue = new Queue('2000','SELL')
queueSystem.createQueue(queue);
queue = new Queue('3000','NOC')
queueSystem.createQueue(queue);

// Enqueue items with different priorities
console.log("\n📦 Enqueuing items...");

queueSystem.enqueue("1000", "Create user John");
queueSystem.enqueue("1000", "Create user Paul");
queueSystem.enqueue("2000", "Create user Marie");
queueSystem.enqueue("3000", "Process payment $50");
queueSystem.enqueue("3000", "Refund transaction");

// Print current queues
console.log("\n📋 Current queue contents:");
queueSystem.printQueues();

// Dequeue items from selected queues (this will respect priority and timestamp)
console.log("\n🔄 Processing items from queues...");

const item1 = queueSystem.dequeueFromSelectedQueues(["1000", "2000", "3000"]);
if (item1) {
  console.log(`\n🎯 Processed item:`, item1.value);
}

const item2 = queueSystem.dequeueFromSelectedQueues(["1000", "2000", "3000"]);
if (item2) {
  console.log(`\n🎯 Processed item:`, item2.value);
}

// Simulate a retry
console.log("\n🔄 Simulating retry on first item...");
queueSystem.retryElement("1000");

// Print queues again to see retries
console.log("\n📋 Updated queue contents:");
queueSystem.printQueues();

// Dequeue remaining items
console.log("\n🔄 Dequeuing remaining items...");

const item3 = queueSystem.dequeueFromSelectedQueues(["1000", "2000", "3000"]);
if (item3) {
  console.log(`\n🎯 Processed item:`, item3.value);
}

const item4 = queueSystem.dequeueFromSelectedQueues(["1000", "2000", "3000"]);
if (item4) {
  console.log(`\n🎯 Processed item:`, item4.value);
}

const item5 = queueSystem.dequeueFromSelectedQueues(["1000", "2000", "3000"]);
if (item5) {
  console.log(`\n🎯 Processed item:`, item5.value);
} else {
  console.log("\n🚫 No more items to process");
}

console.log("\n🏁 Demo completed!");


// Crear agentes y asociarlos a colas
agentManager.addAgent('agent_001', ['1000', '2000']);
agentManager.addAgent('agent_002', ['3000']);
agentManager.addAgent('agent_003', ['1000', '3000']);

    const agentId = agentManager.assignAgentToQueue(queueId);
    if (!agentId) {
      console.log(`🚫 No hay agentes disponibles para la cola ${queueId}`);
      return null;
    }

    eventManager.emit(new AgentEvent('TASK_ASSIGNED', {
      data: { agentId, queueId, item }
    }));

