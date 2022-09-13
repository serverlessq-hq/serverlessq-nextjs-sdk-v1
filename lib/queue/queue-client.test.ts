import { describe, expect, it } from 'vitest'
import { QueueClient } from './queue-client.js'

describe(QueueClient.name, () => {
  it('should create a new queue client', () => {
    const queueClient = new QueueClient()
    expect(queueClient).toBeDefined()
  })

  it('should create a new queue', async () => {
    const queueClient = new QueueClient()
    const queue = await queueClient.createOrUpdate('test-queue')
    expect(queue).toBeDefined()
  })

  it('should enqueue a new job', async () => {
    const queueClient = new QueueClient()
    const job = await queueClient.enqueue({
      method: 'GET',
      target: 'https://google.com'
    })
    expect(job.message).toBe('success')
  })
})
