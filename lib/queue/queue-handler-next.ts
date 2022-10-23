import { QueueClient } from './queue-client.js'
import { NextApiRequest, NextApiResponse, HttpMethod } from '../types/index.js'
import { removeLeadingAndTrailingSlashes } from '../utils/sanitize-input.js'
import {
  VERCEL_URL,
  IS_VERCEL,
  LOCAL_DEVELOPMENT_ERROR
} from '../utils/constants.js'
interface Options {
  urlToOverrideWhenRunningLocalhost?: string
  retries: number
}
type QueueHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>

export interface EnqueueOptions {
  method: HttpMethod
  body?: { [key: string]: any }
}

export function Queue(
  nameOfQueue: string,
  route: string,
  handler: QueueHandler,
  options: Options
) {
  const queueClient = new QueueClient()
  let queueInitDone = false
  async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    return handler(req, res)
  }

  nextApiHandler.enqueue = async (enqueueOptions: EnqueueOptions) => {
    if (!queueInitDone) {
      await queueClient.createOrUpdateQueue(nameOfQueue, {
        retries: options.retries
      })
      queueInitDone = true
    }

    const { method, body } = enqueueOptions
    if (!IS_VERCEL) {
      console.log('Not running on Vercel. Probably on localhost')
      if (!options.urlToOverrideWhenRunningLocalhost) {
        throw new Error(LOCAL_DEVELOPMENT_ERROR)
      }
      return queueClient.enqueue({
        method,
        target: options.urlToOverrideWhenRunningLocalhost,
        body
      })
    } else {
      const sanitizedRoute = removeLeadingAndTrailingSlashes(route)
      return queueClient.enqueue({
        method,
        target: `https://${VERCEL_URL}/${sanitizedRoute}`,
        body
      })
    }
  }

  return nextApiHandler
}
