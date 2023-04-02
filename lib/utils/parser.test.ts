import { expect, test } from "vitest";
import { parseFile } from './parser'

const queue_string =  "import { Queue } from '@serverlessq/nextjs'\n\nexport default Queue({\n    options: {\n        name: 'hello',\n        retries: 3,\n        urlToOverrideWhenRunningLocalhost: 'https://123.eu.ngrok.io/api/hello'\n    },\n    handler: async (req, res) => {\n        res.status(200).json({ name: 'John Doe' })\n    }\n})"
const cron_string = "import { Cron } from '@serverlessq/nextjs'\n\nexport default Cron({\n    options: {\n        name: 'newsletter',\n  retries: 3,\n        expression: '*/1 * * * *',\n        target: 'https://123.eu.ngrok.io/api/hello'\n    },\n    handler: async (req, res) => {\n        res.status(200).json({ name: 'John Doe' })\n    }\n})"

test('should parse a file', () => {
    const ast = parseFile({ file: queue_string, isProduction: false })
    expect(ast?.type).toBe('queue');
    expect(ast?.options).toStrictEqual({
        name: 'DEV_hello',
        retries: 3,
        urlToOverrideWhenRunningLocalhost: 'https://123.eu.ngrok.io/api/hello'
    });
})

test('should add a production prefix', () => {
    const ast = parseFile({ file: cron_string, isProduction: true })
    expect(ast?.type).toBe('cron');
    expect(ast?.options).toStrictEqual({
        name: 'PROD_newsletter',
        expression: '*/1 * * * *',
        target: 'https://123.eu.ngrok.io/api/hello',
        retries: 3
    });
})