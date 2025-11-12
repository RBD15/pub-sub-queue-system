const JobVO = require("../../src/Jobs/JobVO");

describe('JobVO Class Tests',()=>{

    test('should instantiate JobHandler', () => {
        const payload = {msg:"Hola"}
        const jobVO = new JobVO('pendingInteraction','pendingInteraction.js',payload,'5s')
        expect(jobVO).toBeInstanceOf(JobVO)
    });

})