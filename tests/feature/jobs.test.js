const { QueueManager } = require("../../src/queue-system");
const QueueImplementation = require("../../src/Queue/application/QueueImplementation");
const agentService = require("../../src/Service/agent.service");
const { randomTimeStampDate } = require("../../src/Shared/Utils/date");
const JobHandler = require("../../src/JobHandler");
const JobVO = require("../../src/Jobs/JobVO");
const { processData } = require("../../src/Jobs/pendingInteractionJob");
const queueService = require("../../src/Service/queue.service");
const Queue = require("../../src/Queue/application/Queue");
const realtimeQueue = require("../../src/Service/realtimeQueue");

describe('Handle pending interaction', () => {

    let queueManager
    let queueImplementation
    let queueIds=[],values=[]
    let jobHandler,queue1,queue2,timestamp,firstAgent,secondAgent
    let idOperation = '1234'

    beforeAll(async()=>{
        queueImplementation = new QueueImplementation(queueService,agentService,realtimeQueue)
        queueManager = new QueueManager(queueImplementation)
        agentServiceInstance = agentService
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
        firstAgent = {
            "_id": "642ce03160c06a843dfce0f21",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
            "idOperation": "1234",
            "online": true
        }

        secondAgent = {
            "_id": "642ce03160c06a843dfce9992",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [
                {"_id": "1000"},
                {"_id": "2000"}
            ],
            "idOperation": "1234",
            "online": true
        }

        await agentService.create(firstAgent)
        await realtimeQueue.storeAgentInQueues(firstAgent)
        
        await agentService.create(secondAgent)
        await realtimeQueue.storeAgentInQueues(secondAgent)

        jobHandler = new JobHandler()
    })

    // test('Should run pendingInteraction and check agentHandle interaction', async() => {  
        
    //     const jobHandler = new JobHandler()
    //     const payload = {msg:"Hola"}
    //     const jobVO = new JobVO('pendingInteraction','5s','pendingInteractionJob.js',payload)
    //     await jobHandler.add(jobVO)
    //     await jobHandler.run()

    //     expect(agent.name).toBe(secondAgent.name)
    //     expect(agent.interactions).toBe(1)
    //    expect(true).toBe(true)
    // });

    //We had to export processData method from job to run it, test bree.run() or bree.start didnt work
    //TODO: Code to test  bree.start or run 
    test('Should run pendingInteraction and check agentHandle interaction', async() => {  
        let interactions
        await jobHandler.removeAll()

        //Change JobVO interval and timeout, for run once use timeout
        const payload = {queueManager:queueManager}
        const jobVO = new JobVO('pendingInteraction','pendingInteractionJob.js',payload,false,false)
        await jobHandler.add(jobVO)
                
        interactions = await queueManager.getEnqueueHistory()
        expect(interactions.length).toBe(4)

        await processData(queueManager)
        interactions = await queueManager.getEnqueueHistory()
        expect(interactions.length).toBe(3)

     });

})