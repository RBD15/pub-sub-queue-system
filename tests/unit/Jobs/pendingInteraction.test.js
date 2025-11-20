const eventManager = require("rd-event-manager");
const { processData } = require("../../../src/Jobs/pendingInteractionJob");
const { QueueManager } = require("../../../src/queue-system");
const Queue = require("../../../src/Queue/application/Queue");
const agentService = require("../../../src/Service/agent.service");
const { randomTimeStampDate } = require("../../../src/Shared/Utils/date");
const queueService = require("../../../src/Service/queue.service");

describe('Handle pending interaction', () => {

    let queueManager
    let agentServiceInstance
    let ids=[],values=[],queue1,queue2,timestamp,item,agents
    
    beforeAll(async()=>{
        queueManager = new QueueManager(eventManager,queueService)
        agentServiceInstance = agentService
            
        //Creating Queue
        ids.push('1000')
        queue1 = new Queue(ids[0])
        queueManager.createQueue(queue1)

        ids.push('2000')
        queue2 = new Queue(ids[1])
        queueManager.createQueue(queue2)

        //Enqueue Interactions
        values.push("Interaction 1 queue1000")
        timestamp = randomTimeStampDate()
        queueManager.enqueue(ids[0], values[0], timestamp)

        values.push("Interaction 2 queue1000")
        timestamp = randomTimeStampDate()
        queueManager.enqueue(ids[0], values[1], timestamp)

        values.push("Interaction 3 queue1000")
        timestamp = randomTimeStampDate()
        queueManager.enqueue(ids[0], values[2], timestamp)

        values.push("Interaction 1 queue2000")
        timestamp = randomTimeStampDate()
        queueManager.enqueue(ids[1], values[3], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f21",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }

        const secondAgent = {
            "_id": "642ce03160c06a843dfce9992",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }

        await queueManager.agentLogged([queue1.getId()],firstAgent)
        await agentServiceInstance.create(firstAgent)
        await queueManager.agentLogged([queue1.getId()],secondAgent)
        await agentServiceInstance.create(secondAgent)
        await queueManager.agentLogged([queue2.getId()],secondAgent)
    })

    test('should handle pending interactions', async() => {      
        await processData(queueManager)
        interactions = await queueManager.getEnqueueHistory()
        expect(3).toBe(interactions.length)
    });
})