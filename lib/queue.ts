import axios, { AxiosRequestConfig, Method } from 'axios'

type QueueResponse = {
  requestId: string
  message: string
}

export type EnqueueOptions = {
  target: string
  method: Method
}
export class Queue {
  private apiKey: string | undefined
  private queueId: string | undefined
  private endpoint: string

  constructor() {
    this.apiKey = process.env.SERVERLESSQ_API_TOKEN
    this.queueId = process.env.SERVERLESSQ_QUEUE_ID

    if (!this.apiKey || !this.queueId) {
      throw new Error('missing environment variables')
    }
    this.endpoint = `https://api.serverlessq.com?id=${this.queueId}&target=`
  }

  /**
   * send a message to the `Queue`
   */
  public async enqueue(options: EnqueueOptions): Promise<QueueResponse> {
    const { method, target } = options

    if (!options.target || !options.method) {
      throw new Error('no options provided')
    }

    const config: AxiosRequestConfig = {
      method,
      url: this.endpoint + target,
      headers: {
        Accept: 'application/json',
        'x-api-key': this.apiKey as string
      }
    }

    try {
      const response = await axios(config)
      return response.data
    } catch (e) {
      throw new Error('could not enqueue job')
    }
  }
}
