const JobHandler = require("../../src/JobHandler");
const JobVO = require("../../src/Jobs/JobVO");

describe('JobHandler Class Tests',()=>{

    let jobHandler

    test('should instantiate JobHandler', () => {
        jobHandler = new JobHandler()
        expect(jobHandler).toBeInstanceOf(JobHandler)
    });

    test('should add Job', async() => {
        jobHandler = new JobHandler()
        const payload = {msg:"Hola"}
        const jobVO = new JobVO('pendingInteraction','pendingInteraction.js',payload,'5s')
        await jobHandler.add(jobVO)
        const jobs = jobHandler.getJobs()
        expect('pendingInteraction').toBe(jobs[0])
        expect(1).toBe(jobs.length)
    });

    test('Should remove pendingInteractionJob', async() => {  
        let currentJobs
        currentJobs = jobHandler.getJobs()
        expect('pendingInteraction').toBe(currentJobs[0])
        await jobHandler.remove('pendingInteraction')
        currentJobs = jobHandler.getJobs()
        expect(0).toBe(currentJobs.length)
        
    });

})