const { MultiQueue } = require('../../src/queue-system');
const Queue = require('../../src/Queue/application/Queue');
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
    });

})