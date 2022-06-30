import { IncomingHttpHeaders } from 'http'
import { HttpMethod, QueueClient } from './queue-client'
import { removeLeadingAndTrailingSlashes } from './utils/sanitize-input'

const VERCEL_URL = process.env.VERCEL_URL
const IS_VERCEL = process.env.VERCEL
const LOCAL_DEVELOPMENT_ERROR =
  'Not running on Vercel. If your developing with localhost please add the `urlToOverrideWhenRunningLocalhost` flag to the queue options'
interface Options {
  urlToOverrideWhenRunningLocalhost: string
  retries: number
}
interface NextApiRequest {
  body: any
  headers: IncomingHttpHeaders
}
interface NextApiResponse {
  setHeader(key: string, value: string): void
  status(code: number): void
  send(body: string): void
}

type QueueHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>

export interface EnqueueOptions {
  method: HttpMethod
}

export function Queue(
  nameOfQueue: string,
  route: string,
  handler: QueueHandler,
  options: Partial<Options>
) {
  const queueClient = new QueueClient()

  const queue = queueClient.createOrGetQueue(nameOfQueue)
  async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    return handler(req, res)
  }

  nextApiHandler.enqueue = async (enqueueOptions: EnqueueOptions) => {
    const { method } = enqueueOptions
    await queue
    if (!IS_VERCEL) {
      console.log('Not running on Vercel. Probably on localhost')
      if (!options.urlToOverrideWhenRunningLocalhost) {
        throw new Error(LOCAL_DEVELOPMENT_ERROR)
      }
      return queueClient.enqueue({
        method,
        target: options.urlToOverrideWhenRunningLocalhost
      })
    } else {
      const sanitizedRoute = removeLeadingAndTrailingSlashes(route)
      return queueClient.enqueue({
        method,
        target: `https://${VERCEL_URL}/${sanitizedRoute}`
      })
    }
  }

  return nextApiHandler
}
