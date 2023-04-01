import { CronClient, Cron } from './client'
import { HttpMethod } from '../types'
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

import {
  VERCEL_URL,
  IS_VERCEL,
  LOCAL_DEVELOPMENT_ERROR
} from '../utils/constants'
import { extractApiRoute } from '../utils/sanitize-input'

export interface CronOptions {
  name: string
  target: string
  method: HttpMethod
  expression: string
  retries?: number
}

export function Cron(params: {
  handler: NextApiHandler,
  options: CronOptions & {
    urlToOverrideWhenRunningLocalhost?: string
  }
}) {

  const { handler, options } = params

  const cronClient = new CronClient()

  const target = buildCronTarget(options?.urlToOverrideWhenRunningLocalhost)
  
  cronClient
    .createOrUpdate({
      expression: options?.expression,
      method: options?.method,
      name: options?.name,
      retries: options?.retries,
      target
    })
    .then(console.log)
    .catch(console.error)

  async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<unknown> {
    return handler(req, res)
  }
  
  return nextApiHandler
}

const buildCronTarget = (localTarget?: string) => {
  if (!IS_VERCEL) {
    if (!localTarget) {
      throw new Error(LOCAL_DEVELOPMENT_ERROR)
    }
    return localTarget
  } 
  return `https://${VERCEL_URL}/${extractApiRoute(__filename)}` // TODO require base url
}