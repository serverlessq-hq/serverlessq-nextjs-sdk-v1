import { expect, test } from "vitest";
import { parseFile } from './parser'

const queue_string =  "import { Queue } from '@serverlessq/nextjs'\n\nexport default Queue({\n    options: {\n        retries: 3,\n        urlToOverrideWhenRunningLocalhost: 'https://123.eu.ngrok.io/api/hello'\n    },\n    handler: async (req, res) => {\n        res.status(200).json({ name: 'John Doe' })\n    }\n})"

test('should parse a file', () => {
    const ast = parseFile(queue_string)
    expect(ast?.type).toBe('queue');
    expect(ast?.options).toStrictEqual({
        retries: 3,
        urlToOverrideWhenRunningLocalhost: 'https://123.eu.ngrok.io/api/hello'
    });
})
