import { HttpMethod} from '../types'
import {
  IS_VERCEL,
  LOCAL_DEVELOPMENT_ERROR, VERCEL_URL
} from '../utils/constants'
import { extractApiRoute } from '../utils/sanitize-input'
import { QueueClient } from './client'
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

export interface QueueOptions {
  name: string
  urlToOverrideWhenRunningLocalhost?: string
  retries: number
}
export interface EnqueueOptions {
  method: HttpMethod
  body?: { [key: string]: any }
}

export function Queue(params: {
  handler: NextApiHandler,
  options: QueueOptions
}) {
  const queueClient = new QueueClient()
  const { handler, options } = params

  async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<unknown> {
    return handler(req, res)
  }

  nextApiHandler.enqueue = async (enqueueOptions: EnqueueOptions) => {
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
