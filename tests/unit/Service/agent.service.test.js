const agentService = require("../../../src/Service/agent.service")

describe('Agent services tests',()=>{

    let agentInstanceService,agents
    beforeAll(()=>{
        agentInstanceService = agentService
        agents = [
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
        ];
        //Set first agent

    })

    test('Create Agent', async() => {
        const idOperation = "1234"
        const agentsAvailable = await agentInstanceService.create(agents[0])
        const agent = agentsAvailable
        console.log(agent);
        expect(agents[0].name).toBe(agent.name)
    });
    
    test('Get agents by Operation and online', async() => {
        const idOperation = "1234"
        const agentsAvailable = await agentInstanceService.get(idOperation,'true')
        const agent = agentsAvailable[0]
        expect(idOperation).toBe(agent.idOperation)
    });

    test('Get agents by idQueue and online', async() => {
        const name = "Rober"
        const agentsAvailable = await agentInstanceService.getAll("68960b4f74b0b2262e7bdd52","true")
        const agent = agentsAvailable[0]
        expect(name).toBe(agent.name)
    });

    test('Get agents by id', async() => {
        const _id = "642ce03160c06a843dfce0f2"
        const agentsAvailable = await agentInstanceService.getAgentById(_id)
        const agent = agentsAvailable[0]
        expect(_id).toBe(agent._id)
    });

    test('Fail Get agents by id', async() => {
        const _id = "642ce03160c06a843dfc"
        await expect(agentInstanceService.getAgentById(_id))
            .rejects
            .toThrow("Agent id didnt find");
    });

    test('Get agents by email', async() => {
        const email = "r@correo.com"
        const agentsAvailable = await agentInstanceService.getAgentByEmail(email)
        const agent = agentsAvailable
        expect(email).toBe(agent.email)
    });

    test('Fail Get agents by email', async() => {
        const email = "any@correo.com"
        await expect(agentInstanceService.getAgentByEmail(email))
            .rejects
            .toThrow("Agent email didnt find");
    });    

})