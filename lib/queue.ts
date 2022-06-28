import axios, { AxiosRequestConfig, Method } from 'axios'

const ENV_ERROR_MESSAGE =
  'Please set the environment variable SERVERLESSQ_API_TOKEN'

const OPTIONS_ERROR_MESSAGE = 'required options are missing'

const NODE_ENV = process.env.NODE_ENV || 'DEVELOPMENT'

type QueueResponse = {
  requestId: string
  message: string
}

const client = axios.create({
  baseURL:
    NODE_ENV === 'DEVELOPMENT'
      ? 'https://zyceqow9zi.execute-api.us-east-2.amazonaws.com'
      : 'https://api.serverlessq.com',
  timeout: 5000,
  headers: {
    Accept: 'application/json'
  }
})

export type EnqueueOptions = {
  target: string
  method: Method
}

export type EnqueueingOptions = EnqueueOptions & { queueId: string }

export class Queue {
  private apiKey: string | undefined
  private queueName: string | undefined
  private queueId: string | undefined

  constructor() {
    this.apiKey = process.env.SERVERLESSQ_API_TOKEN
    if (!this.apiKey) {
      throw new Error(ENV_ERROR_MESSAGE)
    }
  }

  create = async (nameOfQueue: string) => {
    console.log("Start creating queue '" + nameOfQueue + "'")
    this.queueName = nameOfQueue
    const createQueueApi = axios.create({
      baseURL: `https://zyceqow9zi.execute-api.us-east-2.amazonaws.com/prod/queues/${nameOfQueue}`,
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
      const response = await createQueueApi(config)
      return response.data
    } catch (e) {
      console.log('Error happened: ', e)
      throw new Error('Error creating queue')
    }
  }

  /**
   * send a message to the `Queue`
   */
  enqueue = async (options: EnqueueOptions): Promise<QueueResponse> => {
    const { method, target } = options
    console.log(this.queueName)

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
      console.log('Error: ', e)
      throw new Error('could not enqueue job')
    }
  }

  private validateOptionsOrThrow = (options: EnqueueOptions) => {
    if (!options.target || !options.method) {
      throw new Error(OPTIONS_ERROR_MESSAGE)
    }
  }
}

export const enqueue = async (
  options: EnqueueOptions & { queueId: string }
) => {
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
