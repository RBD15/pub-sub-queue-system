const { MultiQueue, eventManager } = require('../../src/queue-system');
const Queue = require('../../src/Queue/application/Queue');
const AgentStatus = require('../../src/Shared/Event/AgentStatus');
const AgentUpdateStatusEvent = require('../../src/Shared/Event/AgentUpdateStatusEvent');
const AgentUpdateStatusListener = require('../../src/Shared/Listener/AgentUpdateStatusListener');
const { randomTimeStampDate } = require('../../src/Shared/Utils/date');

describe('Queue System Tests',()=>{

    let multiQueue
    beforeAll(() => {
        multiQueue = new MultiQueue()
    });

    test('Create MultiQueue instance', () => {
        expect(multiQueue).toBeInstanceOf(MultiQueue);
    });

    test('Create Queue', () => {
        const id = '1000'
        const queue = new Queue(id)
        expect(queue).toBeInstanceOf(Queue);
        expect(queue.getId()).toBe(id)
    });

    test('Create MultiQueue queue', () => {
        const id = '1000'
        const queue = new Queue(id)
        multiQueue.createQueue(queue)
        expect(queue).toBeInstanceOf(Queue);
        expect(queue.getId()).toBe(id)
    });

    test('Create MultiQueue enqueue', () => {
        const id = '1000'
        const value = "Create user John"
        const queue = new Queue(id)
        multiQueue.createQueue(queue)

        
        multiQueue.enqueue(id, value, 1);
        const queueObject = multiQueue.getQueues()
        expect(queueObject.has(id)).toBe(true)
    });

    test('Create MultiQueue dequeue', () => {
        const id = '1000'
        const value = "Create user John"
        const queue = new Queue(id)
        multiQueue.createQueue(queue)

        multiQueue.enqueue(id, value, 1);
        const item = multiQueue.dequeueFromSelectedQueues([id]);
        expect(item.value).toBe(value)
    });

    test('MultiQueue multi enqueues', () => {
        let ids=[],value,queue,timestamp
        ids.push('1000')
        value = "Create user John"
        queue = new Queue(ids[0])
        multiQueue.createQueue(queue)
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], value, timestamp);

        ids.push('2000')
        value = "Create user Paul"
        queue = new Queue(ids[1])
        multiQueue.createQueue(queue)
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[1], value, timestamp);

        const queueObject = multiQueue.getQueues()
        
        expect(queueObject.has(ids[0])).toBe(true)
        expect(queueObject.has(ids[1])).toBe(true)
    });

    test('MultiQueue multi dequeue', () => {
        let ids=[],values=[],queue,timestamp,item
        ids.push('1000')
        values.push("Create user John")
        queue = new Queue(ids[0])
        multiQueue.createQueue(queue)
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[0], timestamp);

        ids.push('2000')
        values.push("Create user Paul")
        queue = new Queue(ids[1])
        multiQueue.createQueue(queue)
        timestamp = randomTimeStampDate()
        
        multiQueue.enqueue(ids[1], values[1], timestamp);
      
        item = multiQueue.dequeueFromSelectedQueues([ids[0]]);
        expect(item.value).toBe(values[0])

        item = multiQueue.dequeueFromSelectedQueues([ids[1]]);
        expect(item.value).toBe(values[1])
    });

    test('MultiQueue multi dequeue using order', () => {
        let ids=[],values=[],queue,timestamp,item
        multiQueue.cleanQueues()

        ids.push('1000')
        values.push("Create user Maria")
        queue = new Queue(ids[0])
        multiQueue.createQueue(queue)
        timestamp = "2025-09-15T01:50:40"
        multiQueue.enqueue(ids[0], values[0], timestamp);

        values.push("Create user John")
        queue = new Queue(ids[0])
        multiQueue.createQueue(queue)
        timestamp = "2025-09-15T02:50:40"
        multiQueue.enqueue(ids[0], values[1], timestamp);

        ids.push('2000')
        values.push("Create user Paul")
        queue = new Queue(ids[1])
        multiQueue.createQueue(queue)
        timestamp = "2025-09-15T02:49:40"
        multiQueue.enqueue(ids[1], values[2], timestamp);

        ids.push('3000')
        values.push("Create user Jenna")
        queue = new Queue(ids[2])
        multiQueue.createQueue(queue)
        timestamp = "2025-09-15T03:49:40"
        multiQueue.enqueue(ids[2], values[3], timestamp);
              
        item = multiQueue.dequeueFromSelectedQueues([ids[0],ids[1],ids[2]]);
        expect(item.value).toBe(values[0])

        item = multiQueue.dequeueFromSelectedQueues([ids[0],ids[1],ids[2]]);
        expect(item.value).toBe(values[2])

        item = multiQueue.dequeueFromSelectedQueues([ids[0],ids[1],ids[2]]);
        expect(item.value).toBe(values[1])

        item = multiQueue.dequeueFromSelectedQueues([ids[0],ids[1],ids[2]]);
        expect(item.value).toBe(values[3])
    })

    test('MultiQueue agentLogged', async () => {

        multiQueue.cleanQueues()
        let ids=[],agent,values=[],queue,timestamp,currentAgents
        //Creating Queue
        ids.push('1000')
        queue = new Queue(ids[0])
        multiQueue.createQueue(queue)
        
        //Enqueue Interactions
        values.push("Interaction 1")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[0], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f2",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }
        
        currentAgents = multiQueue.getAgentByQueue('1000')
        expect(currentAgents.length).toBe(0)
        
        await multiQueue.agentLogged(queue.getId(),firstAgent)
        currentAgents = multiQueue.getAgentByQueue('1000')
        
        expect(currentAgents.length).toBe(1)
        expect(currentAgents[0].name).toBe(firstAgent.name)
    });
    
    test('MultiQueue handleNextPendingInteraction only one queue', async () => {
        multiQueue.cleanQueues()
        let ids=[],agent,values=[],queue,timestamp,item
        //Creating Queue
        ids.push('1000')
        queue = new Queue(ids[0])
        multiQueue.createQueue(queue)
        
        //Enqueue Interactions
        values.push("Interaction 1")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[0], timestamp)

        values.push("Interaction 2")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[1], timestamp)

        values.push("Interaction 3")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[2], timestamp)

        values.push("Interaction 4")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[3], timestamp)

        values.push("Interaction 5")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[4], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f2",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }
        
        await multiQueue.agentLogged(queue.getId(),firstAgent)
        
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)

        //Record Agent
        const secondAgent = {
            "_id": "642ce03160c06a843dfce999",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }
        await multiQueue.agentLogged(queue.getId(),secondAgent)
        
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)

        //Record Agent
        const thirdAgent = {
            "_id": "642ce03160c06a843dfce988",
            "name": "Third",
            "email": "t@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }
        await multiQueue.agentLogged(queue.getId(),thirdAgent)
        
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

    test('MultiQueue handleNextPendingInteraction two queue', async () => {

        multiQueue.cleanQueues()
        let ids=[],agent,values=[],queue1,queue2,timestamp,item
            
        //Creating Queue
        ids.push('1000')
        queue1 = new Queue(ids[0])
        multiQueue.createQueue(queue1)

        ids.push('2000')
        queue2 = new Queue(ids[1])
        multiQueue.createQueue(queue2)
            
        //Enqueue Interactions
        values.push("Interaction 1")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[0], timestamp)

        values.push("Interaction 2")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[1], timestamp)

        values.push("Interaction 3")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[2], timestamp)

        //Record Agent
        const firstAgent = {
            "_id": "642ce03160c06a843dfce0f2",
            "name": "FirstAgent",
            "email": "f@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }

        await multiQueue.agentLogged(queue1.getId(),firstAgent)
        await multiQueue.agentLogged(queue2.getId(),firstAgent)

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
        multiQueue.enqueue(ids[1], values[3], timestamp)

        values.push("Interaction 5")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[1], values[4], timestamp)
            
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)

        //Record Agent
        const secondAgent = {
            "_id": "642ce03160c06a843dfce999",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }
        await multiQueue.agentLogged(queue2.getId(),secondAgent)
            
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)
    });

    test('MultiQueue handleNextPendingInteraction four queues and 5 agents', async () => {

        multiQueue.cleanQueues()
        let ids=[],agent,values=[],queue1,queue2,timestamp,item
            
        //Creating Queue
        ids.push('1000')
        queue1 = new Queue(ids[0])
        multiQueue.createQueue(queue1)

        ids.push('2000')
        queue2 = new Queue(ids[1])
        multiQueue.createQueue(queue2)
            
        ids.push('3000')
        queue3 = new Queue(ids[2])
        multiQueue.createQueue(queue3)

        ids.push('4000')
        queue4 = new Queue(ids[3])
        multiQueue.createQueue(queue4)
        
        ids.push('5000')
        queue5 = new Queue(ids[4])
        multiQueue.createQueue(queue5)

        //Enqueue Interactions
        values.push("Interaction 1 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[0], timestamp)

        values.push("Interaction 2 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[1], timestamp)

        values.push("Interaction 3 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[2], timestamp)

        values.push("Interaction 1 queue2000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[1], values[3], timestamp)

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

        const thirdAgent = {
            "_id": "642ce03160c06a843dfce8883",
            "name": "ThirdAgent",
            "email": "t@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }

        await multiQueue.agentLogged(queue1.getId(),firstAgent)
        await multiQueue.agentLogged(queue1.getId(),secondAgent)
        await multiQueue.agentLogged(queue2.getId(),secondAgent)

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

        // console.log({interactions1000:multiQueue.getAgentByQueue('1000')});
        // console.log({interactions2000:multiQueue.getAgentByQueue('2000')});

        //Second part
        values.push("Interaction 1 queue3000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[2], values[6], timestamp)

        values.push("Interaction 2 queue3000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[2], values[7], timestamp)
            
        values.push("Interaction 1 queue4000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[3], values[8], timestamp)

        //Record Agent
        const fourAgent = {
            "_id": "642ce03160c06a843dfce9994",
            "name": "Second",
            "email": "s@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }

        await multiQueue.agentLogged(queue3.getId(),thirdAgent)
        await multiQueue.agentLogged(queue3.getId(),secondAgent)
        await multiQueue.agentLogged(queue4.getId(),fourAgent)
        
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(thirdAgent.name)
        expect(agent.interactions).toBe(1)
        
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)

        values.push("Interaction 1 queue5000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[4], values[9], timestamp)
        
        await multiQueue.agentLogged(queue5.getId(),firstAgent)
            
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(fourAgent.name)
        expect(agent.interactions).toBe(1)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)
    });

    test('MultiQueue agentLogout', async () => {

        multiQueue.cleanQueues()
        let ids=[],agent,values=[],queue1,queue2,timestamp,item
            
        //Creating Queue
        ids.push('1000')
        queue1 = new Queue(ids[0])
        multiQueue.createQueue(queue1)

        ids.push('2000')
        queue2 = new Queue(ids[1])
        multiQueue.createQueue(queue2)

        //Enqueue Interactions
        values.push("Interaction 1 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[0], timestamp)

        values.push("Interaction 2 queue1000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], values[1], timestamp)

        values.push("Interaction 1 queue2000")
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[1], values[2], timestamp)

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

        await multiQueue.agentLogged(queue1.getId(),firstAgent)
        await multiQueue.agentLogged(queue1.getId(),secondAgent)
        await multiQueue.agentLogged(queue2.getId(),secondAgent)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(firstAgent.name)
        expect(agent.interactions).toBe(1)

        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)

        await multiQueue.agentLogout(queue2.getId(),secondAgent)
    
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent).toBe(undefined)

        await multiQueue.agentLogged(queue2.getId(),secondAgent)
        agent = await multiQueue.handleNextPendingInteraction()
        expect(agent.name).toBe(secondAgent.name)
        expect(agent.interactions).toBe(1)
    });

    test('MultiQueue multi enqueues', () => {
        let ids=[],value,queue,timestamp

        const queueDoesntExist = '3000'
        ids.push('1000')
        queue = new Queue(ids[0])
        
        ids.push('2000')
        queue = new Queue(ids[1])

        value = "Create user John"
        multiQueue.createQueue(queue)
        timestamp = randomTimeStampDate()
        multiQueue.enqueue(ids[0], value, timestamp);

        value = "Create user Paul"
        multiQueue.createQueue(queue)
        timestamp = randomTimeStampDate()
        expect(()=>{
            multiQueue.enqueue(queueDoesntExist, value, timestamp)
        }).toThrow(`La cola ${queueDoesntExist} no existe.`);
    });

    test('MultiQueue fail loggedAgent', async () => {

      multiQueue.cleanQueues()
      let ids=[],agent,values=[],queue1,queue2,timestamp,item
            
      //Creating Queue
      ids.push('1000')
      queue1 = new Queue(ids[0])
      multiQueue.createQueue(queue1)
            
      //Enqueue Interactions
      values.push("Interaction 1 queue1000")
      timestamp = randomTimeStampDate()
      multiQueue.enqueue(ids[0], values[0], timestamp)

      values.push("Interaction 2 queue1000")
      timestamp = randomTimeStampDate()
      multiQueue.enqueue(ids[0], values[1], timestamp)

      values.push("Interaction 3 queue1000")
      timestamp = randomTimeStampDate()
      multiQueue.enqueue(ids[0], values[2], timestamp)
      
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

      await multiQueue.agentLogged(queue1.getId(),firstAgent)
      await multiQueue.agentLogged(queue1.getId(),secondAgent)
      await expect(multiQueue.agentLogged('',secondAgent))
      .rejects
      .toThrow("Queue id didnt find");

    });

    // test('MultiQueue Fail handleNextPendingInteraction', async () => {
        
    //     multiQueue.cleanQueues()
    //     let ids=[],agent,values=[],queue,timestamp,item
    //     //Creating Queue
    //     ids.push('1000')
    //     queue = new Queue(ids[0])
    //     multiQueue.createQueue(queue)

    //     //Enqueue Interactions
    //     values.push("Interaction 1")
    //     timestamp = randomTimeStampDate()
    //     multiQueue.enqueue(ids[0], values[0], timestamp)

    //     values.push("Interaction 2")
    //     timestamp = randomTimeStampDate()
    //     multiQueue.enqueue(ids[0], values[1], timestamp)

    //     values.push("Interaction 3")
    //     timestamp = randomTimeStampDate()
    //     multiQueue.enqueue(ids[0], values[2], timestamp)

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

    test('MultiQueue testing dispatching AgentStatusEvent', async () => {
        
       multiQueue.cleanQueues()
       let ids=[],agent,values=[],queue1,queue2,timestamp,event,currentAgents
       eventManager.subscribe('agent-change-status',new AgentUpdateStatusListener(multiQueue))
                
       //Creating Queue
       ids.push('1000')
       queue1 = new Queue(ids[0])
       multiQueue.createQueue(queue1)
                
       //Enqueue Interactions
       values.push("Interaction 1")
       timestamp = randomTimeStampDate()
       multiQueue.enqueue(ids[0], values[0], timestamp)

       
       values.push("Interaction 2")
       timestamp = randomTimeStampDate()
       multiQueue.enqueue(ids[0], values[1], timestamp)

       //Record Agent
       const firstAgent = {
           "_id": "642ce03160c06a843dfce0f2",
           "name": "FirstAgent",
           "email": "f@correo.com",
           "idQueue": [
               {"_id": "68960b4f74b0b2262e7bdd52"},
               {"_id": "689ca3b7da3b9bfe5aa782f9"}
           ],
           "idOperation": "1234",
           "online": true
       }

       currentAgents = multiQueue.getAgentByQueue(ids[0])
       expect(currentAgents.length).toBe(0)

       agent = await multiQueue.handleNextPendingInteraction()
       expect(agent).toBe(undefined)

       event = new AgentUpdateStatusEvent(
           ids[0],
           firstAgent,
           AgentStatus.LOGIN,
           'agent-change-status'
       )
       eventManager.emit(event)

       currentAgents = multiQueue.getAgentByQueue(ids[0])
       expect(currentAgents.length).toBe(1)

       agent = await multiQueue.handleNextPendingInteraction()
       expect(agent.name).toBe(firstAgent.name)
       expect(agent.interactions).toBe(1)

       agent = await multiQueue.handleNextPendingInteraction()
       expect(agent.name).toBe(firstAgent.name)
       expect(agent.interactions).toBe(2)

       event = new AgentUpdateStatusEvent(
           ids[0],
           firstAgent,
           AgentStatus.LOGOUT,
           'agent-change-status'
       )
       eventManager.emit(event)

       currentAgents = multiQueue.getAgentByQueue(ids[0])
       expect(currentAgents.length).toBe(0)

    });
})