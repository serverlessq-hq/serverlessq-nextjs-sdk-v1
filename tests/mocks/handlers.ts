import { rest } from 'msw'
import { nodeEnvToURL } from '../../lib/utils/axios.js'

const CRON = {
  id: '0cf49609-4803-47b1-a4b2-4d320de09dc0',
  name: 'test',
  active: true,
  createdAt: '2022-09-12T12:18:39.985Z',
  updatedAt: '2022-09-12T12:18:39.985Z',
  sqsUrl:
    'https://sqs.us-east-2.amazonaws.com/661734112387/cronQueue-3d5a9fd9-0ae9-4a87-ba4c-0528bd90791d.fifo',
  queueId: '3d5a9fd9-0ae9-4a87-ba4c-0528bd90791d',
  userId: 'google-oauth2|117515957043187494119',
  eventbridgeArn:
    'arn:aws:events:us-east-2:661734112387:rule/customerCron-0cf49609-4803-47b1-a4b2-4d320de09dc0',
  method: 'GET',
  scheduleId: 'customerCron-0cf49609-4803-47b1-a4b2-4d320de09dc0',
  target: 'https://jsonplaceholder.typicode.com/users',
  expression: '0/10 * ? * MON-FRI *'
}

const QUEUE = {
  id: '6467deae-b9b5-4027-867f-c6a6a512d20b',
  sqsUrl:
    'https://sqs.us-east-2.amazonaws.com/661734112387/customerQueue-6467deae-b9b5-4027-867f-c6a6a512d20b.fifo',
  name: 'test',
  userId: 'google-oauth2|117515957043187494119',
  arn: 'arn:aws:sqs:us-east-2:661734112387:customerQueue-6467deae-b9b5-4027-867f-c6a6a512d20b.fifo',
  createdAt: '2022-09-13T10:33:53.966Z',
  updatedAt: '2022-09-13T10:33:53.966Z',
  status: 'active',
  queueType: 'queue',
  'variant#createdAt': 'queue#2022-09-13T10:33:53.966Z',
  metaData: {
    retries: 1
  }
}

export const handlers = [
  // handler for 'enqueue' request
  rest.all(`${nodeEnvToURL.development}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'success' }))
  }),
  rest.post(`${nodeEnvToURL.development}/queues/:name`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(CRON))
  }),
  rest.post(`${nodeEnvToURL.development}/crons/:name`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(QUEUE))
  })
]
