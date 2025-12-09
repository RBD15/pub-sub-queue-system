const Queue = require("../../src/Queue/application/Queue");
const QueueImplementation = require("../../src/Queue/application/QueueImplementation");
const agentService = require("../../src/Service/agent.service");
const queueService = require("../../src/Service/queue.service");

describe('Queue Class Tests',()=>{

    let queueImplementation,id,name,agent,idOperation,queueId

    beforeAll(()=>{
        id = '1000'
        name= 'SAC'
        idOperation = '1234'
        queueId = '1000'
        agent = {
            "_id": "642ce03160c06a843dfce0f2",
            "name": "Test",
            "email": "r@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
            "idOperation": "1234",
            "online": true
        }
    })

    test('should create instance', async () => {
        queueImplementation = new QueueImplementation(id,name,idOperation)
        expect(queueImplementation).toBeInstanceOf(QueueImplementation)
    });

    test('should empty agents', async () => {
        queueImplementation = new QueueImplementation(id,name,idOperation)
        await queueImplementation.clean()

        const isAgents = await queueImplementation.isQueueEmpty(idOperation,queueId)
        expect(isAgents).toBe(true)
    });

    test('should be agents', async () => {
        queueImplementation = new QueueImplementation(id,name,idOperation)
        await queueImplementation.clean()

        const queue = new Queue(queueId,queueId,idOperation)
        await queueService.create(queue)
        await agentService.create(agent)

        await queueImplementation.setAgent(agent)
        const agents = await queueImplementation.getAgents(idOperation,queueId)
        expect(agents.length).toBe(1)
        expect(agents[0].name).toBe('Test')
        expect(agents[0].interactions).toBe(0)
    });

    test('should assign agent and increase interaction', async() => {
        queueImplementation = new QueueImplementation(id,name,idOperation)
        await queueImplementation.clean()

        const queue = new Queue(queueId,queueId,idOperation)
        await queueService.create(queue)

        const newAgent = {
            "_id": "600ce03161c06a843dfce0f2",
            "name": "Prueba",
            "email": "test@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
            "idOperation": "1234",
            "online": true
        }
        await agentService.create(newAgent)
        await queueImplementation.setAgent(newAgent)

        const agentAssigned = await queueImplementation.assignAgent(idOperation,queueId)
        expect(agentAssigned.name).toBe(newAgent.name)
        expect(agentAssigned.interactions).toBe(1)      
    });

    test('should clean agent interactions be zero', async () => {
        queueImplementation = new QueueImplementation(id,name,idOperation)
        await queueImplementation.clean()
        const queue = new Queue(queueId,queueId,idOperation)
        await queueService.create(queue)

        const newAgent = {
            "_id": "600ce03161c06a843dfce0f2",
            "name": "Prueba",
            "email": "test@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
            "idOperation": "1234",
            "online": true
        }
        await agentService.create(newAgent)
        await queueImplementation.setAgent(newAgent)

        const agentAssigned = await queueImplementation.assignAgent(idOperation,queueId)
        expect(agentAssigned.name).toBe(newAgent.name)
        expect(agentAssigned.interactions).toBe(1)

        await queueImplementation.cleanAgentInteractions(agentAssigned._id) 
        const agents = await queueImplementation.getAgents(idOperation,queueId)
        expect(agents[0].interactions).toBe(0)
    });

    test('should remove all agents', async () => {
        queueImplementation = new QueueImplementation(id,name,idOperation)
        await queueImplementation.clean()

        const queue = new Queue(queueId,queueId,idOperation)
        await queueService.create(queue)

        const newAgent = {
            "_id": "600ce03161c06a843dfce0f2",
            "name": "Prueba",
            "email": "test@correo.com",
            "idQueue": [
                {"_id": "1000"}
            ],
            "idOperation": "1234",
            "online": true
        }

        await agentService.create(newAgent)
        await queueImplementation.setAgent(newAgent)

        let agents = await queueImplementation.getAgents(idOperation,queueId)
        expect(agents.length).toBe(1)
        expect(agents[0].name).toBe('Prueba')
        expect(agents[0].interactions).toBe(0)

        await queueImplementation.removeAgents()
        agents = await queueImplementation.getAgents(idOperation,queueId)
        expect(agents.length).toBe(0)     
    });

})