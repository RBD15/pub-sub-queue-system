const Queue = require("../../src/Queue/application/Queue");

describe('Queue Class Tests',()=>{

    let queue,id,name,agent
    beforeAll(()=>{
        id = '1000'
        name= 'SAC'
        agent = {
            "_id": "642ce03160c06a843dfce0f2",
            "name": "Test",
            "email": "r@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }
    })

    test('should create instance', () => {
        queue = new Queue(id,name)
        expect(queue).toBeInstanceOf(Queue)
    });

    test('should empty agents', () => {
        const isAgents = queue.isEmpty()
        expect(isAgents).toBe(false)
    });

    test('should be agents', () => {
        queue.setAgent(agent)
        const agents = queue.getAgents()
        expect(agents.length).toBe(1)
        expect(agents[0].name).toBe('Test')
        expect(agents[0].interactions).toBe(0)
    });

    test('should assign agent and increase interaction', () => {
        const newAgent = {
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
        queue.setAgent(newAgent)
        const agentAssigned = queue.assignAgent()
        expect(agentAssigned.name).toBe(agent.name)
        expect(agentAssigned.interactions).toBe(1)      
    });

    test('should agent interactions be zero', () => {
        const agentAssigned = queue.assignAgent()
        expect(agentAssigned.name).toBe(agent.name)
        expect(agentAssigned.interactions).toBe(2)  
        queue.cleanAgentInteractions(agentAssigned._id) 
        const agents = queue.getAgents()
        expect(agents[0].interactions).toBe(0)        
    });

    test('should remove all agents', () => {

        queue = new Queue(id,name)
        queue.setAgent(agent)
        let agents = queue.getAgents()
        expect(agents.length).toBe(1)
        expect(agents[0].name).toBe('Test')
        expect(agents[0].interactions).toBe(0)

        queue.removeAgents()
        agents = queue.getAgents()
        expect(agents.length).toBe(0)     
    });

    test('should clean agents interactions', () => {
        
        const queue = new Queue('2000','2000')
        const first = {
            "_id": "600ce03161c06a843dfce111",
            "name": "First",
            "email": "test@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }

        const second = {
            "_id": "600ce03161c06a843dfce222",
            "name": "Second",
            "email": "t@correo.com",
            "idQueue": [
                {"_id": "68960b4f74b0b2262e7bdd52"},
                {"_id": "689ca3b7da3b9bfe5aa782f9"}
            ],
            "idOperation": "1234",
            "online": true
        }

        queue.setAgent(first)
        queue.setAgent(second)

        const agentAssigned = queue.assignAgent()
        expect(agentAssigned.name).toBe(first.name)
        expect(agentAssigned.interactions).toBe(1)      
    });

})