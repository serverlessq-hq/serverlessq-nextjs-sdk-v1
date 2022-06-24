import axios, { AxiosRequestConfig, Method } from 'axios'

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
export class Queue {
  private apiKey: string | undefined
  private queueId: string | undefined

  constructor(queueId?: string) {
    this.apiKey = process.env.SERVERLESSQ_API_TOKEN
    this.queueId = process.env.SERVERLESSQ_QUEUE_ID || queueId

    if (!this.apiKey || !this.queueId) {
      throw new Error('missing environment variables')
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
      throw new Error('no options provided')
    }
  }
}
