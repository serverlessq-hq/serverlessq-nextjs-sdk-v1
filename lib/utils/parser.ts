// @ts-nocheck 
import { parse } from 'acorn'
import { CronOptions } from '../cron'
import { QueueOptions } from '../queue/handler-next'

type ParseFileResponse =
  | { type: 'cron', options: CronOptions }
  | { type: 'queue', options: QueueOptions }

// TOOD acorn types are not supported, declare manually through module
export const parseFile = (file: string): ParseFileResponse | undefined => {
    const ast = parse(file, { ecmaVersion: 'latest', sourceType: 'module' })
    const callExpression = ast?.body.find(node => node?.type === 'ExportDefaultDeclaration')?.declaration
    const type = callExpression?.callee?.name ?? ''

    switch (type) {
        case 'Queue':
            return { type: 'queue', options: extractOptions(callExpression)}
        case 'Cron':
            return { type: 'cron', options: extractOptions(callExpression)}
        default:
            return;
    }
}

const extractOptions = (callExpression: any): any => {
    const objectExpression = callExpression?.arguments.find(node => node?.type === 'ObjectExpression')?.properties
    const rawOptions = objectExpression?.find(node => node?.key?.name === 'options')?.value?.properties
    const options = rawOptions?.reduce((acc: any, node: any) => {
        acc[node.key.name] = node.value.value
        return acc
    }, {})
    return options
}