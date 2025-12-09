const agentService = require("../../../src/Service/agent.service")

describe('Agent services tests',()=>{

    let agentInstanceService,agents,idOperation
    beforeAll(()=>{
        idOperation = "1234"
        agentInstanceService = agentService
        agents = [
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
                    {"_id": "1000"}
                ],
                "idOperation": "1234",
                "online": false
            }
        ];
        //Set first agent

    })

    test('Create Agent', async() => {
        const agentsAvailable = await agentInstanceService.create(agents[0])
        const agent = agentsAvailable
        expect(agents[0].name).toBe(agent.name)
    });
    
    test('Get agents by Operation and online', async() => {
        await agentInstanceService.create(agents[0])
        const agentsAvailable = await agentInstanceService.get(idOperation,'true')
        const agent = agentsAvailable[0]
        expect(idOperation).toBe(agent.idOperation)
    });

    test('Get agents by idQueue and online', async() => {
        await agentInstanceService.create(agents[0])
        const idQueue = agents[0].idQueue[0]
        const name = agents[0].name
        const agentsAvailable = await agentInstanceService.getAll(idQueue,'true')
        const agent = agentsAvailable[0]
        expect(name).toBe(agent.name)
    });

    test('should be agent status updated', async() => {
        let agentStatus
        const agentId = agents[0]._id

        await agentInstanceService.updateAgentStatus(agentId,false)
        agentStatus = await agentInstanceService.isOnline(agentId)
        expect(agentStatus).toBe(false)
        
        await agentInstanceService.updateAgentStatus(agentId,true)
        agentStatus = await agentInstanceService.isOnline(agentId)
        expect(agentStatus).toBe(true)
    })

    test('Get agents by id', async() => {
        await agentInstanceService.create(agents[0])
        const _id = "642ce03160c06a843dfce0f2"
        const agentsAvailable = await agentInstanceService.getAgentById(_id)
        const agent = agentsAvailable
        expect(_id).toBe(agent._id)
    });

    test('Fail Get agents by id', async() => {
        await agentInstanceService.create(agents[0])
        const _id = "642ce03160c06a843dfc"
        await expect(agentInstanceService.getAgentById(_id))
            .rejects
            .toThrow("Agent id didnt find");
    });

    test('Get agents by queueId and operationId', async() => {
        await agentInstanceService.create(agents[0])
        const idQueue = agents[0].idQueue[0]
        const agentsAvailable = await agentInstanceService.getAgentsByOperationAndQueue(idOperation,idQueue,'true')
        const agent = agentsAvailable[0]
        expect(agents[0]._id).toBe(agent._id)
    });

    test('Get agents by email', async() => {
        await agentInstanceService.create(agents[0])
        const email = "r@correo.com"
        const agentsAvailable = await agentInstanceService.getAgentByEmail(email)
        const agent = agentsAvailable
        expect(email).toBe(agent.email)
    });

    test('Fail Get agents by email', async() => {
        await agentInstanceService.create(agents[0])
        const email = "any@correo.com"
        await expect(agentInstanceService.getAgentByEmail(email))
            .rejects
            .toThrow("Agent email didnt find");
    });    

})