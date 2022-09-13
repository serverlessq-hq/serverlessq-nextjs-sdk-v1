import axios from 'axios'

const API_KEY = process.env.SERVERLESSQ_API_TOKEN
const ENV_ERROR_MESSAGE =
  'Please set the environment variable SERVERLESSQ_API_TOKEN'

export const nodeEnvToURL = {
  development: 'https://zyceqow9zi.execute-api.us-east-2.amazonaws.com/prod',
  production: 'https://api.serverlessq.com'
}

const instance = axios.create({
  baseURL: nodeEnvToURL.development,
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
