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
  options: Omit<CronOptions, 'nameOfCron' | 'target'> & {
    urlToOverrideWhenRunningLocalhost?: string
  }
) {
  const cronClient = new CronClient()
  async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    return handler(req, res)
  }

  nextApiHandler.init = () => {
    let target: string
    if (!IS_VERCEL) {
      if (!options?.urlToOverrideWhenRunningLocalhost) {
        throw new Error(LOCAL_DEVELOPMENT_ERROR)
      }
      target = options?.urlToOverrideWhenRunningLocalhost
    } else {
      const sanitizedRoute = removeLeadingAndTrailingSlashes(route)
      target = `https://${VERCEL_URL}/${sanitizedRoute}`
    }
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
  }

  nextApiHandler.getNextExecution = async () => {
    return await cronClient.getNextExecution()
  }

  return nextApiHandler
}
