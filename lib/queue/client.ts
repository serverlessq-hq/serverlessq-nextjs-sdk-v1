import { HttpMethod } from '../types'
import { checkStringForSlashes } from '../utils/sanitize-input'
import { OPTIONS_ERROR_MESSAGE } from '../utils/constants'
import axiosInstance, { createError } from '../utils/axios'
import { AxiosRequestConfig } from 'axios'
import { Store } from '../store'

type QueueResponse = {
  requestId: string
  message: string
}

export type Queue = {
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
  name: string
  body?: { [key: string]: any }
}

type EnqueueOptions = Omit<EnqueueOptionsWithQueueId, 'queueId'>
export class QueueClient {
  private store = Store.getInstance()

  createOrUpdateQueue = async (
    nameOfQueue: string,
    options: { retries: number }
  ): Promise<Queue> => {
    if (checkStringForSlashes(nameOfQueue)) {
      throw new Error('Queue name cannot contain slashes')
    }

    try {
      const queue = (
        await axiosInstance.post(`/queues/${nameOfQueue}`, options)
      ).data as Queue


      this.store.addQueue(nameOfQueue, queue)

      return queue
    } catch (error) {
      return createError(error, 'could not create or update queue')
    }
  }

  /**
   * send a message to the `Queue`
   */
  enqueue = async (options: EnqueueOptions): Promise<QueueResponse> => {
    const { method, target, body, name } = options

    this.validateOptionsOrThrow(options)

    const PREFIX = process.env.NODE_ENV === 'production' ? '' : 'DEV_';

    const queue = this.store.getQueue(`${PREFIX}${name}`)

    const config: AxiosRequestConfig = {
      method,
      params: {
        id: queue?.id,
        target
      },
      ...(body && { data: { ...body } })
    }

    try {
      console.log(config)
      const response = await axiosInstance.request(config)
      return response.data as QueueResponse
    } catch (error) {
      return createError(error, 'could not enqueue')
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
      id: queueId,
      target
    },
    ...(body && { data: { ...body } })
  }
  try {
    const response = await axiosInstance.request<QueueResponse>(config)
    return response.data
  } catch (error) {
    return createError(error, 'could not enqueue')
  }
}
