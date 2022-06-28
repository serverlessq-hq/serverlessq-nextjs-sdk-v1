import { Queue } from './index'

const VERCEL_URL = process.env.VERCEL_URL
const IS_VERCEL = process.env.VERCEL

// @ts-ignore
export async function QueueHandler(
  nameOfQueue: string,
  route: string,
  // @ts-ignore
  handler: any
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
    console.log('Request is: ', req)
    // const response = await quirrel.respondTo(req.body, req.headers)
    res.status(200)
    // for (const [header, value] of Object.entries(response.headers)) {
    //   res.setHeader(header, value)
    // }
    res.json({ message: 'Done' })
  }

  nextApiHandler.enqueue = () => {
    if (!IS_VERCEL) {
      console.log('Not running on Vercel. Probably on localhost')
      return
    } else {
      q.enqueue({ method: 'GET', target: `https://${VERCEL_URL}/${route}` })
    }
  }

  return nextApiHandler
}
