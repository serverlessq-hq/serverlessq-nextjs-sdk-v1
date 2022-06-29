import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  EnqueueOptions,
  QueueClient,
  enqueue as enqueueStandalone,
  EnqueueOptionsWithQueueId
} from './queue-client'

const server = setupServer(
  rest.get('https://api.serverlessq.com', (req, res, ctx) => {
    const id = req.url.searchParams.get('id')
    const target = req.url.searchParams.get('target')

    return res(
      ctx.status(201),
      ctx.json({
        requestId: id,
        message: target
      })
    )
  })
)

beforeAll(() => server.listen())
beforeEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Queue initialization', async () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should throw an error when no environment variables are set', async () => {
    expect(() => {
      new QueueClient()
    }).toThrow()
  })

  it('should init a Queue when environment variables are set', async () => {
    process.env.SERVERLESSQ_API_TOKEN = 'token'

    expect(() => {
      new QueueClient()
    }).not.toThrow()
  })

  it('should allow to input option queue id', async () => {
    process.env.SERVERLESSQ_API_TOKEN = 'token'

    expect(() => {
      new QueueClient()
    }).not.toThrow()
  })
})

describe('enqueue', async () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env.SERVERLESSQ_API_TOKEN = 'token'
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should return successfully after enqueue', async () => {
    const { enqueue } = new QueueClient()

    const options: EnqueueOptions = {
      method: 'GET',
      target: 'www.google.com'
    }

    const expected = {
      requestId: 'queueId',
      message: 'www.google.com'
    }

    const response = await enqueue(options)

    expect(response).toMatchObject(expected)
  })
})
describe('enqueue standalone', async () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env.SERVERLESSQ_API_TOKEN = 'token'
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should return successfully after enqueue', async () => {
    const options: EnqueueOptionsWithQueueId = {
      method: 'GET',
      target: 'www.google.com',
      queueId: 'queueId'
    }

    const expectedResult = {
      requestId: 'queueId',
      message: 'www.google.com'
    }

    const response = await enqueueStandalone(options)

    expect(response).toMatchObject(expectedResult)
  })
})
