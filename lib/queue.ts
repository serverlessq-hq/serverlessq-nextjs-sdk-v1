import axios, { AxiosRequestConfig, Method } from 'axios'

const ENV_ERROR_MESSAGE =
  'Please set the environment variable SERVERLESSQ_API_TOKEN'

const OPTIONS_ERROR_MESSAGE = 'required options are missing'

type QueueResponse = {
  requestId: string
  message: string
}

const client = axios.create({
  baseURL: 'https://api.serverlessq.com',
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
  private queueId: string | undefined

  constructor(queueId: string) {
    this.apiKey = process.env.SERVERLESSQ_API_TOKEN
    this.queueId = queueId
    if (!this.apiKey) {
      throw new Error(ENV_ERROR_MESSAGE)
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
