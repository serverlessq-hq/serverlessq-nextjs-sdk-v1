import { CronClient, Cron } from './client.js'
import { HttpMethod } from '../types/index.js'
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

import {
  VERCEL_URL,
  IS_VERCEL,
  LOCAL_DEVELOPMENT_ERROR
} from '../utils/constants.js'
import { extractApiRoute } from '../utils/sanitize-input.js'

export interface CronOptions {
  nameOfCron: string
  target: string
  method: HttpMethod
  expression: string
  retries?: number
}

export function Cron(params: {
  name: string,
  handler: NextApiHandler,
  options: Omit<CronOptions, 'nameOfCron' | 'target'> & {
    urlToOverrideWhenRunningLocalhost?: string
  }
}) {

  const { name, handler, options } = params

  const cronClient = new CronClient()

  const target = buildCronTarget(options?.urlToOverrideWhenRunningLocalhost)
  
  cronClient
    .createOrUpdate({
      expression: options?.expression,
      method: options?.method,
      nameOfCron: name,
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
  return `https://${VERCEL_URL}/${extractApiRoute(__filename)}`
}