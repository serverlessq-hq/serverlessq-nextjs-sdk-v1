import { CronClient } from './cron-client.js'
import {
  NextApiRequest,
  NextApiResponse,
  HttpMethod,
  Handler
} from '../types/index.js'

export interface CronOptions {
  nameOfCron: string
  target: string
  method: HttpMethod
  expression: string
  retries?: number
}
export function Cron(_route: string, handler: Handler, options: CronOptions) {
  const cronClient = new CronClient()
  let cronInitDone = false

  if (!cronInitDone) {
    cronClient.createOrGetCron(options)
    cronInitDone = true
  }

  async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    return handler(req, res)
  }

  return nextApiHandler
}
