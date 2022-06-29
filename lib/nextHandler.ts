import { Queue } from './index'

const VERCEL_URL = process.env.VERCEL_URL
const IS_VERCEL = process.env.VERCEL

interface Options {
  urlToOverrideWhenRunningLocalhost: string
  retries: number
}

// TODO: Options for retries
// TODO: Test if handler runs
// TODO: Test if localhost override works

// @ts-ignore
export async function QueueHandler(
  nameOfQueue: string,
  route: string,
  // @ts-ignore
  handler: any,
  options: Options
) {
  // Create or get queue
  const q = new Queue()
  const response = await q.create(nameOfQueue)
  console.log('Response from create: ', response)

  const target = `https://${VERCEL_URL}/${route}`
  console.log('Target is: ', target)

  // @ts-ignore
  async function nextApiHandler(req: any, res: any) {
    console.log('In next api handler')
    const responseFromHandler = await handler(req, res)
    console.log('Response from handler: ', responseFromHandler)
    res.status(200)
    res.json({ message: 'Done' })
  }

  nextApiHandler.enqueue = () => {
    if (!IS_VERCEL) {
      console.log('Not running on Vercel. Probably on localhost')
      q.enqueue({
        method: 'GET',
        target: options.urlToOverrideWhenRunningLocalhost
      })
      return
    } else {
      q.enqueue({ method: 'GET', target: `https://${VERCEL_URL}/${route}` })
    }
  }

  return nextApiHandler
}
