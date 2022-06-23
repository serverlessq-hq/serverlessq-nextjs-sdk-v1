import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { EnqueueOptions, Queue } from './queue'
import { beforeAll, beforeEach, afterAll, expect, describe, it } from 'vitest'

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
      new Queue()
    }).toThrow()
  })

  it('should init a Queue when environment variables are set', async () => {
    process.env.SERVERLESSQ_API_TOKEN = 'token'
    process.env.SERVERLESSQ_QUEUE_ID = 'queueId'

    expect(() => {
      new Queue()
    }).not.toThrow()
  })
})

describe('enqueu', async () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env.SERVERLESSQ_API_TOKEN = 'token'
    process.env.SERVERLESSQ_QUEUE_ID = 'queueId'
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should return successfully after enqueue', async () => {
    const { enqueue } = new Queue()

    const options: EnqueueOptions = {
      method: 'GET',
      target: 'www.google.com'
    }

    const exptectedResult = {
      requestId: 'queueId',
      message: 'www.google.com'
    }

    const response = await enqueue(options)

    expect(response).toMatchObject(exptectedResult)
  })
})
