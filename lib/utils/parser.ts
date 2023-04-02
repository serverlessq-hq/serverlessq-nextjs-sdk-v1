// @ts-nocheck 
import { parse } from 'acorn'
import { CronOptions } from '../cron'
import { QueueOptions } from '../queue/handler-next'

export type ParseFileResponse =
  | { type: 'cron', options: CronOptions }
  | { type: 'queue', options: QueueOptions }

// acorn types are not supported, declare manually through module
export const parseFile = (params: { file: string, isProduction: boolean }): ParseFileResponse | undefined => {
    const ast = parse(params.file, { ecmaVersion: 'latest', sourceType: 'module' })
    const callExpression = ast?.body.find(node => node?.type === 'ExportDefaultDeclaration')?.declaration
    const type = callExpression?.callee?.name ?? ''

    const PREFIX = params.isProduction ? 'PROD_' : 'DEV_'

    const options = extractOptions(callExpression);

    if(!type || !options) return;

    return {
        type: type.toLowerCase() as 'cron' | 'queue',
        options: { ...options, name: `${PREFIX}${options.name}` }
    }
}

const extractOptions = (callExpression: any) => {
    const objectExpression = callExpression?.arguments.find(node => node?.type === 'ObjectExpression')?.properties
    const rawOptions = objectExpression?.find(node => node?.key?.name === 'options')?.value?.properties
    const options = rawOptions?.reduce((acc: any, node: any) => {
        acc[node.key.name] = node.value.value
        return acc
    }, {})
    return options
}