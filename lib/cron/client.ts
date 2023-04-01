import {
  OPTIONS_ERROR_MESSAGE,
  SLASH_ERROR_MESSAGE
} from '../utils/constants'
import { checkStringForSlashes } from '../utils/sanitize-input'
import { CronOptions } from './handler-next'
import axiosInstance from '../utils/axios'

export type Cron = {
  id: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  method: string
  target: string
  expression: string
}

export class CronClient {
  private cronName: string | undefined

  constructor() {}

  createOrUpdate = async (options: CronOptions): Promise<Cron> => {
    this.validateOptionsOrThrow(options)
    const { method, nameOfCron, target, retries, expression } = options
    this.cronName = nameOfCron

    if (checkStringForSlashes(this.cronName)) {
      throw new Error(SLASH_ERROR_MESSAGE)
    }

    const payload = {
      method,
      target,
      retries,
      cronExpression: expression
    }

    try {
      return (await axiosInstance.post(`/crons/${this.cronName}`, payload))
        .data as Cron
    } catch (e) {
      console.error(e)
      throw new Error('Error creating cron')
    }
  }
  
  private validateOptionsOrThrow = (options: CronOptions) => {
    if (!options.target || !options.method || !options.expression) {
      throw new Error(OPTIONS_ERROR_MESSAGE)
    }
  }
}