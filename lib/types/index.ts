import { NextApiRequest, NextApiResponse } from './next.js'

export { NextApiRequest, NextApiResponse }
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type Handler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>
