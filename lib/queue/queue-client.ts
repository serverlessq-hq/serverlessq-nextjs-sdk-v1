import { AxiosRequestConfig } from 'axios'
import { HttpMethod } from '../types/index.js'
import { checkStringForSlashes } from '../utils/sanitize-input.js'
import axiosInstance from '../utils/axios.js'

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
/**
 * @param target - the target of the message queue
 * @param method - http method executed against the target
 * @param queueId - the id of the message queue
 */
export type EnqueueOptionsWithQueueId = {
  target: string
  method: HttpMethod
  queueId: string
  body?: { [key: string]: any }
}

type EnqueueOptions = Omit<EnqueueOptionsWithQueueId, 'queueId'>

export class QueueClient {
  private queueName: string | undefined
  private queueId: string | undefined

  constructor() {}

  createOrGetQueue = async (nameOfQueue: string): Promise<Queue> => {
    this.queueName = nameOfQueue

    if (checkStringForSlashes(nameOfQueue)) {
      throw new Error('Queue name cannot contain slashes')
    }

    try {
      const createOrUpdateQueue = (
        await axiosInstance.post(`/queues/${this.queueName}`)
      ).data as Queue
      this.queueId = createOrUpdateQueue.id
      return createOrUpdateQueue
    } catch (e) {
      console.log(e)
      throw new Error('Error creating queue')
    }
  }

  /**
   * send a message to the `Queue`
   */
  enqueue = async (options: EnqueueOptions): Promise<QueueResponse> => {
    const { method, target, body } = options

    this.validateOptionsOrThrow(options)

    const config: AxiosRequestConfig = {
      method,
      params: {
        target,
        id: this.queueId
      },
      ...(body && { data: { ...body } })
    }

    try {
      const response = await axiosInstance.request(config)
      return response.data as QueueResponse
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
  const { method, target, queueId, body } = options

  if (!options.target || !options.method || !options.queueId) {
    throw new Error(OPTIONS_ERROR_MESSAGE)
  }

  const config: AxiosRequestConfig = {
    method,
    params: {
      target,
      id: queueId
    },
    ...(body && { data: { ...body } })
  }
  try {
    const response = await axiosInstance.request(config)
    return response.data
  } catch (e) {
    throw new Error('could not enqueue job')
  }
}
