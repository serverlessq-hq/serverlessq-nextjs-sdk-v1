type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

type QueueResponse = {
  requestId: string
  message: string
}

export type EnqueuOptions = {
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
  public async enqueue(options: EnqueuOptions): Promise<QueueResponse> {
    const { method, target } = options

    if (!options.target || !options.method) {
      throw new Error('no options provided')
    }

    try {
      const response = await fetch(this.endpoint + target, {
        method,
        mode: 'no-cors',
        headers: {
          Accept: 'application/json',
          'x-api-key': this.apiKey as string
        }
      })

      const data = await response.json()
      return data
    } catch (e) {
      throw new Error('could not enqueue job')
    }
  }
}
