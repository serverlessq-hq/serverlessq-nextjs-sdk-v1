import { HttpMethod} from '../types/index.js'
import {
  IS_VERCEL,
  LOCAL_DEVELOPMENT_ERROR, VERCEL_URL
} from '../utils/constants.js'
import { extractApiRoute } from '../utils/sanitize-input.js'
import { QueueClient } from './client.js'
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

interface Options {
  urlToOverrideWhenRunningLocalhost?: string
  retries: number
}
export interface EnqueueOptions {
  method: HttpMethod
  body?: { [key: string]: any }
}

export function Queue(params: {
  name: string,
  handler: NextApiHandler,
  options: Options
}) {
  const queueClient = new QueueClient()
  const { name, handler, options } = params
  let queueInitDone = false

  async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<unknown> {
    return handler(req, res)
  }

  nextApiHandler.enqueue = async (enqueueOptions: EnqueueOptions) => {
    if (!queueInitDone) {
      await queueClient.createOrUpdateQueue(name, {
        retries: options.retries
      })
      queueInitDone = true
    }

    const { method, body } = enqueueOptions
    let target: string;

    if (!IS_VERCEL) {
      console.log('Not running on Vercel. Probably on localhost')
      if (!options.urlToOverrideWhenRunningLocalhost) {
        throw new Error(LOCAL_DEVELOPMENT_ERROR)
      }
      target = options.urlToOverrideWhenRunningLocalhost
      
    } else {
      target = `https://${VERCEL_URL}/${extractApiRoute(__filename)}`
    }
    return queueClient.enqueue({
      method,
      target,
      body
    })
  }

  return nextApiHandler
}
