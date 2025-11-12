const Bree = require('bree');
const path = require('path');

class JobHandler {
  #bree
  constructor() {
    this.#bree = new Bree({
      root: false,
      jobs: [
        // {
        //   name: 'pendingInteraction',
        //   path: path.join(__dirname,'Jobs','pendingInteraction.js'),
        //   interval: '5s',
        //   worker: {
        //     workerData: {msg:'Hi'}
        //   }
        // }
      ]
    });   
  }

  async add(job){
    const jobParams = {
      name: job.getName(),
      path: path.join(__dirname,'Jobs',job.getJobFileName()),
      worker: {
        workerData: job.getPayload()
      }
    }

    if(job.getInterval())
      jobParams.interval = job.getInterval()

    if(job.getTimeout())
      jobParams.timeout = job.getTimeout()

    await this.#bree.add(jobParams);
  }

  async remove(jobName){
    await this.#bree.remove(jobName)
  }

  async removeAll(){
    for (const name of this.#bree.config.jobs.map(job => job.name)) {
      await this.#bree.remove(name);
    }
  }

  getJobs(){
    return this.#bree.config.jobs.map(job => job.name)
  }

  async start(jobName){
    await this.#bree.start(jobName);
  }

  async stop(){
    await this.#bree.stop();
  }

  async run(){
    await this.#bree.run();
  }
  
}

module.exports = JobHandler