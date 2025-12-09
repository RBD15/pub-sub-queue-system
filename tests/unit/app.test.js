const eventManager = require('rd-event-manager');
const { QueueManager } = require('../../src/queue-system');
const QueueImplementation = require('../../src/Queue/application/QueueImplementation');
const AgentStatus = require('../../src/Shared/Event/AgentStatus');
const AgentUpdateStatusEvent = require('../../src/Shared/Event/AgentUpdateStatusEvent');
const AgentUpdateStatusListener = require('../../src/Shared/Listener/AgentUpdateStatusListener');
const { randomTimeStampDate } = require('../../src/Shared/Utils/date');
const queueService = require('../../src/Service/queue.service');
const EnqueueEvent = require('../../src/Shared/Event/EnqueueEvent');
const EnqueueListener = require('../../src/Shared/Listener/EnqueueListener');
const EnqueueInteraction = require('../../src/Queue/Domain/EnqueueInteraction');
const Queue = require('../../src/Queue/application/Queue');
const agentService = require('../../src/Service/agent.service');
const realtimeQueue = require('../../src/Service/realtimeQueue');

describe('Queue System Tests',()=>{

    let multiQueue,idOperation,queueImplementation
    beforeAll(() => {
        queueImplementation = new QueueImplementation()
        multiQueue = new QueueManager(queueImplementation)
        idOperation = "1234"
    });

    test('Create QueueManager instance', () => {
        const queueImplementationTest = new QueueImplementation()
        const multiQueue = new QueueManager(queueImplementationTest)
        expect(multiQueue).toBeInstanceOf(QueueManager);
    });

    test('Fail to create QueueManager instance', () => {
       expect(() => new QueueManager())
      .toThrow("QueueInterface implementation is required to create QueueManager");
    });

    test('Create Queue', () => {
        const queueId = '1000'
        const queue = new Queue(queueId,queueId,idOperation)
        expect(queue).toBeInstanceOf(Queue);
        expect(queue.getId()).toBe(queueId)
    });

    test('Create and store a new queue', async() => {
        const queueId = '1000'
        const queue = new Queue(queueId,queueId,idOperation)
        await queueService.create(queue)

        const queueFounded = await queueService.getQueueById(queueId)
        expect(queueFounded.id).toBe(queueId)
    });

    test('Crete a Queue and Enqueue item on QueueManager ', async() => {
        const queueId = '1000'
        const queue = new Queue(queueId,queueId,idOperation)
        await queueService.create(queue)
        
        const value = "Create user John"
        multiQueue.enqueue(idOperation,queueId, value, 1);
        const enqueuesItems = multiQueue.getEnqueueHistory()
        expect(enqueuesItems.length).toBe(1)
        expect(enqueuesItems[0].queueId).toBe(queueId)
    });

    test('Create QueueManager enqueue event', async() => {
        await multiQueue.cleanQueues()
        eventManager.subscribe('QUEUE_ENQUEUED', new EnqueueListener(multiQueue));
        const queueId = '1000'
        const queue = new Queue(queueId,queueId,idOperation)
        await queueService.create(queue)
        
        const value = "Create user John"
        eventManager.emit(new EnqueueEvent(
            'QUEUE_ENQUEUED',
            new EnqueueInteraction(idOperation,queueId,value,1)
        ))
        // multiQueue.enqueue(idOperation,id, value, 1);
        const enqueuesItems = multiQueue.getEnqueueHistory()
        expect(enqueuesItems.length).toBe(1)
        expect(enqueuesItems[0].queueId).toBe(queueId)
    });

    // test('Create QueueManager dequeue', () => {
    //     const id = '1000'
    //     const value = "Create user John"
    //     const queue = new QueueImplementation(id)
    //     multiQueue.setQueue(queue)

    //     multiQueue.enqueue(idOperation,id, value, 1);
    //     const item = multiQueue.dequeueFromSelectedQueues([id]);
    //     expect(item.value).toBe(value)
    // });

    test('QueueManager multi enqueues', async() => {
        await multiQueue.cleanQueues()
        let queueIds=[],value,queue,timestamp
        queueIds.push('1000')
        queue = new Queue(queueIds[0],queueIds[0],idOperation)
        await queueService.create(queue)

        value = "Create user John"
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], value, timestamp);

        queueIds.push('2000')
        queue = new Queue(queueIds[1],queueIds[0],idOperation)
        await queueService.create(queue)

        value = "Create user Paul"
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[1], value, timestamp);

        const enqueuesItems = multiQueue.getEnqueueHistory()
        expect(enqueuesItems.length).toBe(2)
        expect(enqueuesItems[0].queueId).toBe(queueIds[0])
        expect(enqueuesItems[1].queueId).toBe(queueIds[1])
    });

    test('should check pending interactions', async() => {
        await multiQueue.cleanQueues()

        let queueIds=[],value,queue,timestamp
        queueIds.push('1000')
        
        queue = new Queue(queueIds[0],queueIds[0],idOperation)
        await queueService.create(queue)

        value = "Interaction 1"
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], value, timestamp);

        value = "Interaction 2"
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], value, timestamp);

        value = "Interaction 3"
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], value, timestamp);

        value = "Interaction 4"
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], value, timestamp);

        const pendingInteractions = multiQueue.getEnqueueHistory()
        expect(pendingInteractions.length).toBe(4)
    });

    test('QueueManager agentLogging', async () => {

        await multiQueue.cleanQueues()
        let queueIds=[],agent,values=[],queue1,queue2,timestamp,item
            
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
        multiQueue.enqueue(idOperation,queueIds[0], values[0], timestamp)

        values.push("Interaction 2 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[1], timestamp)

        values.push("Interaction 1 queue2000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[1], values[2], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f21",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
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
        await realtimeQueue.storeAgentInQueues(firstAgent)

        await agentService.create(secondAgent)
        await realtimeQueue.storeAgentInQueues(secondAgent)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)

        await realtimeQueue.loggingAgent(secondAgent, queueIds[0])
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)

        await realtimeQueue.logoutAgent(secondAgent, queueIds[0])
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent).toBe(undefined)

        await realtimeQueue.loggingAgent(firstAgent, queueIds[1])
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)
    });

    test('QueueManager agentLogout', async () => {

        await multiQueue.cleanQueues()
        let queueIds=[],agent,values=[],queue1,queue2,timestamp,item
            
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
        multiQueue.enqueue(idOperation,queueIds[0], values[0], timestamp)

        values.push("Interaction 2 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[1], timestamp)

        values.push("Interaction 1 queue2000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[1], values[2], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f21",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
            "idOperation": "1234",
            "online": true
        }

        const secondAgent = {
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

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)

        await realtimeQueue.logoutAgent(secondAgent, queueIds[1])
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent).toBe(undefined)

        await realtimeQueue.loggingAgent(secondAgent, queueIds[1])
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)
    });

    test('QueueManager fail loggedAgent', async () => {

      await multiQueue.cleanQueues()
      let queueIds=[],agent,values=[],queue1,timestamp
            
      //Creating Queue
      queueIds.push('1000')
      queue1 = new Queue(queueIds[0],queueIds[0],idOperation)
      await queueService.create(queue1)

      //Enqueue Interactions
      values.push("Interaction 1 queue1000")
      timestamp = randomTimeStampDate()
      multiQueue.enqueue(idOperation,queueIds[0], values[0], timestamp)

      values.push("Interaction 2 queue1000")
      timestamp = randomTimeStampDate()
      multiQueue.enqueue(idOperation,queueIds[0], values[1], timestamp)

      values.push("Interaction 3 queue1000")
      timestamp = randomTimeStampDate()
      multiQueue.enqueue(idOperation,queueIds[0], values[2], timestamp)
      
      //Record Agent
      const firstAgent = {
          "_id": "642ce03160c06a843dfce0f21",
          "name": "FirstAgent",
          "email": "f@correo.com",
          "idQueue": [
              {"_id": "1000"}
          ],
          "idOperation": "1234",
          "online": true
      }

      const secondAgent = {
          "_id": "642ce03160c06a843dfce9992",
          "name": "Second",
          "email": "s@correo.com",
          "idQueue": [
              {"_id": "1000"}
          ],
          "idOperation": "1234",
          "online": true
      }

        await agentService.create(firstAgent)
        await realtimeQueue.storeAgentInQueues(firstAgent)

        await agentService.create(secondAgent)
        await realtimeQueue.storeAgentInQueues(secondAgent)

      await expect(realtimeQueue.loggingAgent([''],secondAgent))
      .rejects
      .toThrow("Queue id didnt find");

    });

    // test('QueueManager multi dequeue', async() => {
    //     await multiQueue.cleanQueues()
    //     let queuequeueIds=[],values=[],queue,timestamp,item
    //     queueIds.push('1000')
    //     queue = new Queue(queueIds[0],queueIds[0],idOperation)
    //     await queueService.create(queue)

    //     values.push("Create user John")
    //     timestamp = randomTimeStampDate()
    //     multiQueue.enqueue(idOperation,queueIds[0], values[0], timestamp);

    //     queueIds.push('2000')
    //     queue = new Queue(queueIds[1],queueIds[1],idOperation)
    //     await queueService.create(queue)
        
    //     values.push("Create user Paul")
    //     timestamp = randomTimeStampDate()        
    //     multiQueue.enqueue(idOperation,queueIds[1], values[1], timestamp);
      
    //     item = multiQueue.dequeueFromSelectedQueues([queueIds[0]]);
    //     expect(item.value).toBe(values[0])

    //     item = multiQueue.dequeueFromSelectedQueues([queueIds[1]]);
    //     expect(item.value).toBe(values[1])
    // });

    // test('QueueManager multi dequeue using order', () => {
    //     let ids=[],values=[],queue,timestamp,item
    //     await multiQueue.cleanQueues()

    //     ids.push('1000')
    //     values.push("Create user Maria")
    //     queue = new QueueImplementation(ids[0])
    //     multiQueue.setQueue(queue)
    //     timestamp = "2025-09-15T01:50:40"
    //     multiQueue.enqueue(idOperation,ids[0], values[0], timestamp);

    //     values.push("Create user John")
    //     queue = new QueueImplementation(ids[0])
    //     multiQueue.setQueue(queue)
    //     timestamp = "2025-09-15T02:50:40"
    //     multiQueue.enqueue(idOperation,ids[0], values[1], timestamp);

    //     ids.push('2000')
    //     values.push("Create user Paul")
    //     queue = new QueueImplementation(ids[1])
    //     multiQueue.setQueue(queue)
    //     timestamp = "2025-09-15T02:49:40"
    //     multiQueue.enqueue(idOperation,ids[1], values[2], timestamp);

    //     ids.push('3000')
    //     values.push("Create user Jenna")
    //     queue = new QueueImplementation(ids[2])
    //     multiQueue.setQueue(queue)
    //     timestamp = "2025-09-15T03:49:40"
    //     multiQueue.enqueue(idOperation,ids[2], values[3], timestamp);
              
    //     item = multiQueue.dequeueFromSelectedQueues([ids[0],ids[1],ids[2]]);
    //     expect(item.value).toBe(values[0])

    //     item = multiQueue.dequeueFromSelectedQueues([ids[0],ids[1],ids[2]]);
    //     expect(item.value).toBe(values[2])

    //     item = multiQueue.dequeueFromSelectedQueues([ids[0],ids[1],ids[2]]);
    //     expect(item.value).toBe(values[1])

    //     item = multiQueue.dequeueFromSelectedQueues([ids[0],ids[1],ids[2]]);
    //     expect(item.value).toBe(values[3])
    // })

    // test('QueueManager agentLogged', async () => {
    //     await multiQueue.cleanQueues()
    //     let queueIds=[],agent,values=[],queue,timestamp,currentAgents
    //     //Creating Queue
    //     queueIds.push('1000')
    //     queue = new Queue(queueIds[0],queueIds[0],idOperation)
    //     await queueService.create(queue)
        
    //     //Enqueue Interactions
    //     values.push("Interaction 1")
    //     timestamp = randomTimeStampDate()
    //     multiQueue.enqueue(idOperation,queueIds[0], values[0], timestamp)

    //     //Record Agent
    //     const firstAgent = {
    //         "_id": "642ce03160c06a843dfce0f2",
    //         "name": "FirstAgent",
    //         "email": "f@correo.com",
    //         "idQueue": [
    //             {"_id": "68960b4f74b0b2262e7bdd52"},
    //             {"_id": "689ca3b7da3b9bfe5aa782f9"}
    //         ],
    //         "idOperation": "1234",
    //         "online": true
    //     }
    //     await agentService.create(firstAgent)
    //     await queueService.
        
    //     currentAgents = multiQueue.getAgentByQueue('1000')
    //     expect(currentAgents.length).toBe(0)
        
    //     await multiQueue.agentLogged([queue.getId()],firstAgent)
    //     currentAgents = multiQueue.getAgentByQueue('1000')
        
    //     expect(currentAgents.length).toBe(1)
    //     expect(currentAgents[0].name).toBe(firstAgent.name)
    // });
    
    test('QueueManager handleNextPendingInteraction only one queue', async () => {
        await multiQueue.cleanQueues()
        let queueIds=[],agent,values=[],queue,timestamp

        //Creating Queue
        queueIds.push('1000')
        queue = new Queue(queueIds[0],queueIds[0],idOperation)
        await queueService.create(queue)
        
        //Enqueue Interactions
        values.push("Interaction 1")
        timestamp = randomTimeStampDate()
        //Modify this to pass idOperation as part of the interaction
        multiQueue.enqueue(idOperation,queueIds[0], values[0], timestamp)

        values.push("Interaction 2")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[1], timestamp)

        values.push("Interaction 3")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[2], timestamp)

        values.push("Interaction 4")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[3], timestamp)

        values.push("Interaction 5")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[4], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f2",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
            "idOperation": "1234",
            "online": true
        }
        
        await agentService.create(firstAgent)
        await realtimeQueue.storeAgentInQueues(firstAgent)
        agent = await multiQueue.handleNextPendingInteraction()
        
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)

        //Record Agent
        const secondAgent = {
            "_id": "642ce03160c06a843dfce999",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
            "idOperation": "1234",
            "online": true
        }

        await agentService.create(secondAgent)
        await realtimeQueue.storeAgentInQueues(secondAgent)
        
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)

        //Record Agent
        const thirdAgent = {
            "_id": "642ce03160c06a843dfce988",
            "name": "Third",
            "email": "t@correo.com",
            "idQueue": [
                {"_id": "1000"},
            ],
            "idOperation": "1234",
            "online": true
        }
        await agentService.create(thirdAgent)
        await realtimeQueue.storeAgentInQueues(thirdAgent)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(thirdAgent.name)
        expect(agent.interactions).toBe(1)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(2)
        
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(2)
    });

    test('QueueManager handleNextPendingInteraction two queue', async () => {

        await multiQueue.cleanQueues()
        let queueIds=[],agent,values=[],queue1,queue2,timestamp
            
        //Creating Queue
        queueIds.push('1000')
        queue1 = new Queue(queueIds[0],queueIds[0],idOperation)
        await queueService.create(queue1)

        queueIds.push('2000')
        queue2 = new Queue(queueIds[1],queueIds[1],idOperation)
        await queueService.create(queue2)
            
        //Enqueue Interactions
        values.push("Interaction 1")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[0], timestamp)

        values.push("Interaction 2")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[1], timestamp)

        values.push("Interaction 3")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[2], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f2",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "1000"},
                {"_id": "2000"}
            ],
            "idOperation": "1234",
            "online": true
        }

        await agentService.create(firstAgent)
        await realtimeQueue.storeAgentInQueues(firstAgent)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(2)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(3)

        //Second part
        values.push("Interaction 4")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[1], values[3], timestamp)

        values.push("Interaction 5")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[1], values[4], timestamp)
            
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)

        //Record Agent
        const secondAgent = {
            "_id": "642ce03160c06a843dfce999",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [
                {"_id": "2000"}
            ],
            "idOperation": "1234",
            "online": true
        }
        
        await agentService.create(secondAgent)
        await realtimeQueue.storeAgentInQueues(secondAgent)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)
    });

    test('QueueManager handleNextPendingInteraction four queues and 5 agents', async () => {

        await multiQueue.cleanQueues()
        let queueIds=[],agent,values=[],queue1,queue2,timestamp,item
            
        //Creating Queue

        queueIds.push('1000')
        queue1 = new Queue(queueIds[0],queueIds[0],idOperation)
        await queueService.create(queue1)

        queueIds.push('2000')
        queue2 = new Queue(queueIds[1],queueIds[1],idOperation)
        await queueService.create(queue2)
            
        queueIds.push('3000')
        queue3 = new Queue(queueIds[2],queueIds[2],idOperation)
        await queueService.create(queue3)

        queueIds.push('4000')
        queue4 = new Queue(queueIds[3],queueIds[3],idOperation)
        await queueService.create(queue4)
        
        queueIds.push('5000')
        queue5 = new Queue(queueIds[4],queueIds[4],idOperation)
        await queueService.create(queue5)

        //Enqueue Interactions
        values.push("Interaction 1 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[0], timestamp)

        values.push("Interaction 2 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[1], timestamp)

        values.push("Interaction 3 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[0], values[2], timestamp)

        values.push("Interaction 1 queue2000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[1], values[3], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f21",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
            "idOperation": "1234",
            "online": true
        }

        const secondAgent = {
            "_id": "642ce03160c06a843dfce9992",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [
                {"_id": "1000"},
                {"_id": "2000"},
                {"_id": "3000"}
            ],
            "idOperation": "1234",
            "online": true
        }

        const thirdAgent = {
            "_id": "642ce03160c06a843dfce8883",
            "name": "ThirdAgent",
            "email": "t@correo.com",
            "idQueue": [
                {"_id": "3000"}
            ],
            "idOperation": "1234",
            "online": true
        }
        await agentService.create(firstAgent)
        await realtimeQueue.storeAgentInQueues(firstAgent)
        
        await agentService.create(secondAgent)
        await realtimeQueue.storeAgentInQueues(secondAgent)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(2)
        
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)

        //Second part
        values.push("Interaction 1 queue3000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[2], values[6], timestamp)

        values.push("Interaction 2 queue3000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[2], values[7], timestamp)
            
        values.push("Interaction 1 queue4000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[3], values[8], timestamp)

        //Record Agent
        const fourAgent = {
            "_id": "642ce03160c06a843dfce9994",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [
                {"_id": "4000"},
            ],
            "idOperation": "1234",
            "online": true
        }

        await agentService.create(thirdAgent)
        await realtimeQueue.storeAgentInQueues(thirdAgent)

        await agentService.create(fourAgent)
        await realtimeQueue.storeAgentInQueues(fourAgent)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)
        
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(thirdAgent.name)
        expect(agent.interactions).toBe(1)

        values.push("Interaction 1 queue5000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(idOperation,queueIds[4], values[9], timestamp)
        
        await agentService.create(fourAgent)
        await realtimeQueue.storeAgentInQueues(fourAgent)
            
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(fourAgent.name)
        expect(agent.interactions).toBe(1)

        await realtimeQueue.loggingAgent(firstAgent, queueIds[4])
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)
    });

    // test('QueueManager multi enqueues', async() => {
    //     let queueIds=[],value,queue,timestamp

    //     const queueDoesntExist = '3000'
    //     queueIds.push('1000')
    //     queue1 = new Queue(queueIds[0],queueIds[0],idOperation)
    //     await queueService.create(queue1)
        
    //     queueIds.push('2000')
    //     queue = new Queue(queueIds[0],queueIds[0],idOperation)
    //     await queueService.create(queue1)

    //     value = "Interaction 1"
    //     // multiQueue.setQueue(queue)
    //     timestamp = randomTimeStampDate()
    //     multiQueue.enqueue(idOperation,queueIds[0], value, timestamp);

    //     value = "Interaction 2"
    //     // multiQueue.setQueue(queue)
    //     timestamp = randomTimeStampDate()
    //     expect(()=>{
    //         multiQueue.enqueue(idOperation,queueDoesntExist, value, timestamp)
    //     }).toThrow(`La cola ${queueDoesntExist} no existe.`);
    // });

    // test('QueueManager Fail handleNextPendingInteraction', async () => {
        
    //     await multiQueue.cleanQueues()
    //     let ids=[],agent,values=[],queue,timestamp,item
    //     //Creating Queue
    //     ids.push('1000')
    //     queue = new QueueImplementation(ids[0])
    //     multiQueue.setQueue(queue)

    //     //Enqueue Interactions
    //     values.push("Interaction 1")
    //     timestamp = randomTimeStampDate()
    //     multiQueue.enqueue(idOperation,ids[0], values[0], timestamp)

    //     values.push("Interaction 2")
    //     timestamp = randomTimeStampDate()
    //     multiQueue.enqueue(idOperation,ids[0], values[1], timestamp)

    //     values.push("Interaction 3")
    //     timestamp = randomTimeStampDate()
    //     multiQueue.enqueue(idOperation,ids[0], values[2], timestamp)

    //     //Record Agent
    //     const firstAgent = {
    //         "_id": "642ce03160c06a843dfce0f2",
    //         "name": "FirstAgent",
    //         "email": "f@correo.com",
    //         "idQueue": [
    //             {"_id": "68960b4f74b0b2262e7bdd52"},
    //             {"_id": "689ca3b7da3b9bfe5aa782f9"}
    //         ],
    //         "idOperation": "1234",
    //         "online": true
    //     }

    //     agent = await multiQueue.handleNextPendingInteraction()
    //     expect(agent.name).toBe(firstAgent.name)
    //     expect(agent.interactions).toBe(1)

    // });

test('QueueManager testing dispatching AgentStatusEvent', async () => {
        
       await multiQueue.cleanQueues()
       let queueIds=[],agent,values=[],queue1,queue2,timestamp,event,currentAgents
       eventManager.subscribe('agent-change-status',new AgentUpdateStatusListener(queueImplementation))

       //Creating Queue
        queueIds.push('1000')
        queue1 = new Queue(queueIds[0],queueIds[0],idOperation)
        await queueService.create(queue1)

        queueIds.push('2000')        
        queue2 = new Queue(queueIds[1],queueIds[1],idOperation)
        await queueService.create(queue2)

       //Enqueue Interactions
       values.push("Interaction 1")
       timestamp = randomTimeStampDate()
       multiQueue.enqueue(idOperation,queueIds[0], values[0], timestamp)

       values.push("Interaction 2")
       timestamp = randomTimeStampDate()
       multiQueue.enqueue(idOperation,queueIds[1], values[1], timestamp)

       values.push("Interaction 3")
       timestamp = randomTimeStampDate()
       multiQueue.enqueue(idOperation,queueIds[1], values[2], timestamp)

       //Record Agent
       const firstAgent = {
           "_id": "642ce03160c06a843dfce0f2",
           "name": "FirstAgent",
           "email": "f@correo.com",
           "idQueue": [
                {"_id": "2000"},
            ],
           "idOperation": "1234",
           "online": true
       }
        await agentService.create(firstAgent)
        await realtimeQueue.storeAgentInQueues(firstAgent)
        
       currentAgents = await multiQueue.getAgentByQueue(idOperation,queueIds[0])
       expect(currentAgents.length).toBe(0)

       agent = await multiQueue.handleNextPendingInteraction()
       expect(agent).toBe(undefined)

       event = new AgentUpdateStatusEvent(
           queueIds[0],
           firstAgent,
           AgentStatus.LOGIN,
           'agent-change-status'
       )
       eventManager.emit(event)

       // waitFor helper, wait until the handler finishes and the agent appears in the queue
       const waitFor = async (predicate, timeout = 2000, interval = 20) => {
           const start = Date.now()
           while (true) {
               if (await predicate()) return
               if (Date.now() - start > timeout) throw new Error('timeout waiting for predicate')
               // eslint-disable-next-line no-await-in-loop
               await new Promise(r => setTimeout(r, interval))
           }
       }

       await waitFor(async () => {
           const agents = await multiQueue.getAgentByQueue(idOperation, queueIds[0])
           return agents.length === 1
       })

       currentAgents = await multiQueue.getAgentByQueue(idOperation,queueIds[0])
       expect(currentAgents.length).toBe(1)

       agent = await multiQueue.handleNextPendingInteraction()
       expect(agent.name).toBe(firstAgent.name)
       expect(agent.interactions).toBe(1)

       agent = await multiQueue.handleNextPendingInteraction()
       expect(agent.name).toBe(firstAgent.name)
       expect(agent.interactions).toBe(1)

       event = new AgentUpdateStatusEvent(
           queueIds[0],
           firstAgent,
           AgentStatus.LOGOUT,
           'agent-change-status'
       )
       eventManager.emit(event)

       await waitFor(async () => {
           const agents = await multiQueue.getAgentByQueue(idOperation, queueIds[0])
           return agents.length === 0
       })

       currentAgents = await multiQueue.getAgentByQueue(idOperation,queueIds[0])
       expect(currentAgents.length).toBe(0)

    });
})