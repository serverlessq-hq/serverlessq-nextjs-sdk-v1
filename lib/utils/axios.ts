import axios from 'axios'
import { ENV_ERROR_MESSAGE } from './constants'

export const createError = (error: Error | any, origin: string) => {
  if (axios.isAxiosError(error)) {
    throw new Error(`${origin} | ${error.message}`)
  } else throw new Error(origin)
}

const API_KEY = process.env.SERVERLESSQ_API_TOKEN

const nodeEnvToURL = {
  development: 'https://h7m87enp08.execute-api.us-east-2.amazonaws.com/prod',
  production: 'https://api.serverlessq.com/'
}

const instance = axios.create({
  baseURL: nodeEnvToURL.production,
  timeout: 5000
})

instance.interceptors.request.use(config => {
  if (!API_KEY) {
    throw new Error(ENV_ERROR_MESSAGE)
  }

  config.headers!['x-api-key'] = API_KEY
  return config
})

instance.defaults.headers.common['Accept'] = 'application/json'
instance.defaults.headers.post['Content-Type'] = 'application/json'

export default instance
