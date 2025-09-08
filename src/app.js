const { MultiQueue, eventManager } = require('./queue-system'); // Adjust path as needed

// Create the queue system
const queueSystem = new MultiQueue();

// Subscribe to events for logging
eventManager.subscribe('QUEUE_ENQUEUED', {
  handle: (event) => {
    console.log(`\n🔔 ITEM ENQUEUED:`);
    console.log(`   Queue: ${event.data.queueId}`);
    console.log(`   Value: ${event.data.item.value}`);
    console.log(`   Priority: ${event.data.item.priority}`);
    console.log(`   Timestamp: ${event.data.item.timestamp.toISOString()}`);
  }
});

eventManager.subscribe('QUEUE_DEQUEUED', {
  handle: (event) => {
    console.log(`\n✅ ITEM DEQUEUED:`);
    console.log(`   Queue: ${event.data.queueId}`);
    console.log(`   Value: ${event.data.item.value}`);
    console.log(`   Priority: ${event.data.item.priority}`);
    console.log(`   Retries: ${event.data.item.retries}`);
  }
});

// Create some queues
console.log("🔧 Creating queues...");
queueSystem.createQueue("user-queue");
queueSystem.createQueue("notification-queue");
queueSystem.createQueue("payment-queue");

// Enqueue items with different priorities
console.log("\n📦 Enqueuing items...");

queueSystem.enqueue("user-queue", "Create user John", 1);
queueSystem.enqueue("user-queue", "Update user profile", 2);
queueSystem.enqueue("notification-queue", "Send welcome email", 3);
queueSystem.enqueue("payment-queue", "Process payment $50", 1);
queueSystem.enqueue("payment-queue", "Refund transaction", 2);

// Print current queues
console.log("\n📋 Current queue contents:");
queueSystem.printQueues();

// Dequeue items from selected queues (this will respect priority and timestamp)
console.log("\n🔄 Processing items from queues...");

const item1 = queueSystem.dequeueFromSelectedQueues(["user-queue", "notification-queue", "payment-queue"]);
if (item1) {
  console.log(`\n🎯 Processed item:`, item1.value);
}

const item2 = queueSystem.dequeueFromSelectedQueues(["user-queue", "notification-queue", "payment-queue"]);
if (item2) {
  console.log(`\n🎯 Processed item:`, item2.value);
}

// Simulate a retry
console.log("\n🔄 Simulating retry on first item...");
queueSystem.retryElement("user-queue");

// Print queues again to see retries
console.log("\n📋 Updated queue contents:");
queueSystem.printQueues();

// Dequeue remaining items
console.log("\n🔄 Dequeuing remaining items...");

const item3 = queueSystem.dequeueFromSelectedQueues(["user-queue", "notification-queue", "payment-queue"]);
if (item3) {
  console.log(`\n🎯 Processed item:`, item3.value);
}

const item4 = queueSystem.dequeueFromSelectedQueues(["user-queue", "notification-queue", "payment-queue"]);
if (item4) {
  console.log(`\n🎯 Processed item:`, item4.value);
}

const item5 = queueSystem.dequeueFromSelectedQueues(["user-queue", "notification-queue", "payment-queue"]);
if (item5) {
  console.log(`\n🎯 Processed item:`, item5.value);
} else {
  console.log("\n🚫 No more items to process");
}

console.log("\n🏁 Demo completed!");
