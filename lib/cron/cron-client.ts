import axios, { AxiosRequestConfig } from 'axios'
import { ENV_ERROR_MESSAGE, OPTIONS_ERROR_MESSAGE } from '../utils/consts.js'
import { checkStringForSlashes } from '../utils/sanitize-input.js'
import { CronOptions } from './cron-handler-next.js'

export class CronClient {
  private apiKey: string | undefined
  private cronName: string | undefined

  constructor() {
    this.apiKey = process.env.SERVERLESSQ_API_TOKEN
    if (!this.apiKey) {
      throw new Error(ENV_ERROR_MESSAGE)
    }
  }

  createOrGetCron = async (options: CronOptions): Promise<any> => {
    this.validateOptionsOrThrow(options)
    const { method, nameOfCron, target, retries, expression } = options
    this.cronName = nameOfCron

    if (checkStringForSlashes(this.cronName)) {
      throw new Error('Cron name cannot contain slashes')
    }

    const createOrGetCronApi = axios.create({
      baseURL: `https://api.serverlessq.com/crons/${this.cronName}`,
      timeout: 5000,
      headers: {
        Accept: 'application/json'
      }
    })

    const config: AxiosRequestConfig = {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey as string
      },
      data: {
        method,
        target,
        retries,
        expression
      }
    }

    try {
      const createOrGetCron = (await createOrGetCronApi(config)).data as any
      return createOrGetCron
    } catch (e) {
      console.error(e)
      throw new Error('Error creating cron')
    }
  }

  private validateOptionsOrThrow = (options: CronOptions) => {
    if (
      !options.target ||
      !options.method ||
      !options.expression ||
      !options.nameOfCron
    ) {
      throw new Error(OPTIONS_ERROR_MESSAGE)
    }
  }
}
