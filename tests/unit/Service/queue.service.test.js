const queueService = require("../../../src/Service/queue.service");

describe('Queue Service Test',()=>{
    
    let queueInstanceService,queues
    beforeAll(()=>{
        queueInstanceService = queueService
    })

    test('should add new queue', async() => {
        let queuesAvailable
        queuesAvailable = await queueInstanceService.getAllByOperation('1234')
            
        expect(queuesAvailable.length).toBe(0)
        const queue = {
            idOperation: '1234',
            id:'1000',
            name:'SAC',
            agents: [
                {
                    "_id": "642ce03160c06a843dfce0f2",
                    "name": "Rober",
                    "email": "r@correo.com",
                    "idQueue": [
                        {"_id": "68960b4f74b0b2262e7bdd52"},
                        {"_id": "689ca3b7da3b9bfe5aa782f9"}
                    ],
                    "idOperation": "1234",
                    "online": true
                },
                {
                    "_id": "600ce03161c06a843dfce0f2",
                    "name": "Prueba",
                    "email": "test@correo.com",
                    "idQueue": [
                        {"_id": "68960b4f74b0b2262e7bdd52"},
                        {"_id": "689ca3b7da3b9bfe5aa782f9"}
                    ],
                    "idOperation": "1234",
                    "online": false
                }
            ]
        }
        queueInstanceService.create(queue)  
        queuesAvailable = await queueInstanceService.getAllByOperation('1234')

        expect(queuesAvailable.length).toBe(1)
    });

    test('should queue return agents', async() => {
        let queuesAvailable
        queuesAvailable = await queueInstanceService.getQueuesWithAgents('1234')
        expect(queuesAvailable.length).toBe(1)
        expect(queuesAvailable[0].agents.length).toBe(2)
    });

    test('should queue return only online agents', async() => {
        const queueId = '1000'
        queueAvailableAgents = await queueInstanceService.getQueueWithAvailableAgents('1234',queueId)
        expect(queueAvailableAgents.length).toBe(1)
        expect(queueAvailableAgents[0].name).toBe("Rober")
    });

    test('should queue founded by id', async() => {
        const queueId = '1000'
        queueFounded = await queueInstanceService.getQueueById(queueId)
        expect(queueFounded.length).toBe(1)
    });

    test('should queue was founded by id', async() => {
        const queueId = '1001'
        queueFounded =   await expect(queueInstanceService.getQueueById(queueId))
        .rejects
        .toThrow('Queue id didnt find');
    });

})