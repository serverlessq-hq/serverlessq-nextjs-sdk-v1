import { CronClient, Cron } from './cron-client.js'
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

export function Cron(name: string, handler: Handler) {
  const cronClient = new CronClient()
  let cron: Cron

  async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    return handler(req, res)
  }

  nextApiHandler.createOrUpdate = async (
    options: Omit<CronOptions, 'nameOfCron'>
  ) => {
    cron = await cronClient.createOrUpdate({ ...options, nameOfCron: name })
    return cron
  }

  nextApiHandler.delete = async () => {}

  nextApiHandler.getCurrentExecution = async () => {
    return cron
  }

  return nextApiHandler
}
