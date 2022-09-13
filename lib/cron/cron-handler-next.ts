import { CronClient, Cron } from './cron-client.js'
import {
  NextApiRequest,
  NextApiResponse,
  HttpMethod,
  Handler
} from '../types/index.js'
import {
  VERCEL_URL,
  IS_VERCEL,
  LOCAL_DEVELOPMENT_ERROR
} from '../utils/constants.js'
import { removeLeadingAndTrailingSlashes } from '../utils/sanitize-input.js'

export interface CronOptions {
  nameOfCron: string
  target: string
  method: HttpMethod
  expression: string
  retries?: number
}

export function Cron(
  name: string,
  route: string,
  handler: Handler,
  cronOptions?: { urlToOverrideWhenRunningLocalhost: string }
) {
  const cronClient = new CronClient()
  let cron: Cron

  async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    return handler(req, res)
  }

  nextApiHandler.createOrUpdate = async (
    options: Omit<CronOptions, 'nameOfCron' | 'target'>
  ) => {
    let target: string
    if (!IS_VERCEL) {
      if (!cronOptions?.urlToOverrideWhenRunningLocalhost) {
        throw new Error(LOCAL_DEVELOPMENT_ERROR)
      }
      target = cronOptions?.urlToOverrideWhenRunningLocalhost
    } else {
      const sanitizedRoute = removeLeadingAndTrailingSlashes(route)
      target = `https://${VERCEL_URL}/${sanitizedRoute}`
    }
    cron = await cronClient.createOrUpdate({
      ...options,
      nameOfCron: name,
      target
    })
    return cron
  }

  nextApiHandler.getCurrentExecution = async () => {
    return cron
  }

  return nextApiHandler
}
