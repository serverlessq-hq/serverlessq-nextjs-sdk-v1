import axios, { AxiosRequestConfig } from 'axios'
import { checkStringForSlashes } from './utils/sanitize-input.js'

const ENV_ERROR_MESSAGE =
  'Please set the environment variable SERVERLESSQ_API_TOKEN'

const OPTIONS_ERROR_MESSAGE = 'required options are missing'

type QueueResponse = {
  requestId: string
  message: string
}

type Queue = {
  queueType: string
  userId: string
  updatedAt: string
  status: string
  createdAt: string
  sqsUrl: string
  'variant#createdAt': string
  id: string
  arn: string
  name: string
  metaData: { retries: number }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/**
 * @param target - the target of the message queue
 * @param method - http method executed against the target
 * @param queueId - the id of the message queue
 */
export type EnqueueOptionsWithQueueId = {
  target: string
  method: HttpMethod
  queueId: string
}

type EnqueueOptions = Omit<EnqueueOptionsWithQueueId, 'queueId'>

const client = axios.create({
  baseURL: 'https://api.serverlessq.com',
  timeout: 5000,
  headers: {
    Accept: 'application/json'
  }
})

export class QueueClient {
  private apiKey: string | undefined
  private queueName: string | undefined
  private queueId: string | undefined

  constructor() {
    this.apiKey = process.env.SERVERLESSQ_API_TOKEN
    if (!this.apiKey) {
      throw new Error(ENV_ERROR_MESSAGE)
    }
  }

  createOrGetQueue = async (nameOfQueue: string): Promise<Queue> => {
    this.queueName = nameOfQueue

    if (checkStringForSlashes(nameOfQueue)) {
      throw new Error('Queue name cannot contain slashes')
    }

    const createOrGetQueueApi = axios.create({
      baseURL: `https://api.serverlessq.com/queues/${this.queueName}`,
      timeout: 5000,
      headers: {
        Accept: 'application/json'
      }
    })

    const config: AxiosRequestConfig = {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey as string
      }
    }

    try {
      const createOrGetQueue = (await createOrGetQueueApi(config)).data as Queue
      this.queueId = createOrGetQueue.id
      return createOrGetQueue
    } catch (e) {
      throw new Error('Error creating queue')
    }
  }

  /**
   * send a message to the `Queue`
   */
  enqueue = async (options: EnqueueOptions): Promise<QueueResponse> => {
    const { method, target } = options

    this.validateOptionsOrThrow(options)

    const config: AxiosRequestConfig = {
      method,
      params: {
        target,
        id: this.queueId
      },
      headers: {
        Accept: 'application/json',
        'x-api-key': this.apiKey as string
      }
    }

    try {
      const response = await client(config)
      return response.data
    } catch (e) {
      throw new Error('could not enqueue job')
    }
  }

  private validateOptionsOrThrow = (options: EnqueueOptions) => {
    if (!options.target || !options.method) {
      throw new Error(OPTIONS_ERROR_MESSAGE)
    }
  }
}

/**
 * enqueue a message to an already existing queue
 * @param options - required options to enqueue a message
 */
export const enqueue = async (options: EnqueueOptionsWithQueueId) => {
  const { method, target, queueId } = options
  const apiKey = process.env.SERVERLESSQ_API_TOKEN

  if (!options.target || !options.method || !options.queueId) {
    throw new Error(OPTIONS_ERROR_MESSAGE)
  }

  if (!apiKey) {
    throw new Error(ENV_ERROR_MESSAGE)
  }

  const config: AxiosRequestConfig = {
    method,
    params: {
      target,
      id: queueId
    },
    headers: {
      Accept: 'application/json',
      'x-api-key': apiKey as string
    }
  }
  try {
    const response = await client(config)
    return response.data
  } catch (e) {
    throw new Error('could not enqueue job')
  }
}
