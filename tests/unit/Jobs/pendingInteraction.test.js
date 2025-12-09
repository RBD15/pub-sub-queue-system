const { processData } = require("../../../src/Jobs/pendingInteractionJob");
const { QueueManager } = require("../../../src/queue-system");
const QueueImplementation = require("../../../src/Queue/application/QueueImplementation");
const agentService = require("../../../src/Service/agent.service");
const { randomTimeStampDate } = require("../../../src/Shared/Utils/date");
const queueService = require("../../../src/Service/queue.service");
const Queue = require("../../../src/Queue/application/Queue");
const realtimeQueue = require("../../../src/Service/realtimeQueue");

describe('Handle pending interaction', () => {

    let queueManager
    let queueIds=[],values=[],queue1,queue2,timestamp,idOperation
    
    beforeAll(async()=>{
        queueManager = new QueueManager(new QueueImplementation())
        idOperation = "1234"
            
        //Creating Queue
        
        queueIds.push('1000')
        queue1 = new Queue(queueIds[0],queueIds[0],idOperation)
        await queueService.create(queue1)

        queueIds.push('2000')
        queue2 = new Queue(queueIds[1],queueIds[1],idOperation)
        await queueService.create(queue2)

        //Enqueue Interactions
        values.push("Interaction 1 queue1000")
        timestamp = randomTimeStampDate()
        queueManager.enqueue(idOperation,queueIds[0], values[0], timestamp)

        values.push("Interaction 2 queue1000")
        timestamp = randomTimeStampDate()
        queueManager.enqueue(idOperation,queueIds[0], values[1], timestamp)

        values.push("Interaction 3 queue1000")
        timestamp = randomTimeStampDate()
        queueManager.enqueue(idOperation,queueIds[0], values[2], timestamp)

        values.push("Interaction 1 queue2000")
        timestamp = randomTimeStampDate()
        queueManager.enqueue(idOperation,queueIds[1], values[3], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f21",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [],
            "idOperation": "1234",
            "online": true
        }

        const secondAgent = {
            "_id": "642ce03160c06a843dfce9992",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [],
            "idOperation": "1234",
            "online": true
        }

        await agentService.create(firstAgent)
        await agentService.create(secondAgent)

        await realtimeQueue.loggingAgent(firstAgent, queueIds[0])
        await realtimeQueue.loggingAgent(secondAgent, queueIds[0])
        await realtimeQueue.loggingAgent(secondAgent, queueIds[1])
    })

    test('should handle pending interactions', async() => {           
        await processData(queueManager)
        interactions = await queueManager.getEnqueueHistory()
        expect(interactions.length).toBe(3)
    });
})