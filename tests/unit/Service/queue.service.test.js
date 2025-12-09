const Queue = require("../../../src/Queue/application/Queue");
const queueService = require("../../../src/Service/queue.service");

describe('Queue Service Test',()=>{
    
    let queueInstanceService,queues,idOperation
    beforeAll(()=>{
        queueInstanceService = queueService
        idOperation = '1234'
    })

    test('should add new queue', async() => {
        let queuesAvailable
        queuesAvailable = await queueInstanceService.getAllQueuesByOperation(idOperation)
            
        expect(queuesAvailable.length).toBe(0)
        const queueJson = {
            idOperation: idOperation,
            id:'1000',
            name:'SAC',
            agents: [
                {
                    "_id": "642ce03160c06a843dfce0f2",
                    "name": "Rober",
                    "email": "r@correo.com",
                    "idQueue": [
                        {"_id": "1000"},
                        {"_id": "2000"}
                    ],
                    "idOperation": "1234",
                    "online": true
                },
                {
                    "_id": "600ce03161c06a843dfce0f2",
                    "name": "Prueba",
                    "email": "test@correo.com",
                    "idQueue": [
                        {"_id": "1000"},
                    ],
                    "idOperation": "1234",
                    "online": false
                }
            ]
        }
        const queue = new Queue(queueJson.id,queueJson.id,queueJson.idOperation)
        queue.setAgentsJson(queueJson.agents)
        await queueService.create(queue)

        queuesAvailable = await queueInstanceService.getAllQueuesByOperation(idOperation)
        expect(queuesAvailable.length).toBe(1)
    });

    test('should queue return agents', async() => {
        let queuesAvailable
        queuesAvailable = await queueInstanceService.getQueuesWithAgents(idOperation)
        expect(queuesAvailable.length).toBe(1)
        expect(queuesAvailable[0].agents.length).toBe(2)
    });

    test('should queue return only online agents', async() => {
        const queueId = '1000'
        queueAvailableAgents = await queueInstanceService.getQueueWithAvailableAgents(idOperation,queueId)
        expect(queueAvailableAgents.length).toBe(1)
        expect(queueAvailableAgents[0].name).toBe("Rober")
    });

    test('should queue founded by id', async() => {
        const queueId = '1000'
        queueFounded = await queueInstanceService.getQueueById(queueId)
        expect(queueFounded.id).toBe(queueId)
    });

    test('should queue wasnt founded by id', async() => {
        const queueId = '1001'
        queueFounded =   await expect(queueInstanceService.getQueueById(queueId))
        .rejects
        .toThrow('Queue id didnt find');
    });

})