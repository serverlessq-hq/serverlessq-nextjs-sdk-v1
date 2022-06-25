<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@serverlessq/nextjs">
    <img alt="" src="https://badgen.net/npm/v/@serverlessq/nextjs">
  </a>
  <a aria-label="Package size" href="https://bundlephobia.com/result?p=@serverlessq/nextjs">
    <img alt="" src="https://badgen.net/bundlephobia/minzip/@serverlessq/nextjs">
  </a>
  <a aria-label="License" href="https://github.com/vercel/swr/blob/main/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/@serverlessq/nextjs">
  </a>
</p>

## Introduction

`@ServerlessQ/nextjs` is a lightweight wrapper to easily utilize the managed queue by [ServerlessQ](https://serverlessq.com).

ServerlessQ lets you easily create **Message Queues** and **Cron Jobs** to truly build asynchronous systems.

---

**View full documentation and examples on [docs.serverlessq.com](https://docs.serverlessq.com).**

<br/>

## Installation

Install the library through your desired package manager

```
yarn add @serverlessq/nextjs
```

```
npm i @serverlessq/nextjs
```

```
pnpm i @serverlessq/nextjs
```

<br/>

This library gives you easy access for using [ServerlessQ](https://serverlessq.com).

## Environment Variables

You need to set the `SERVERLESSQ_API_TOKEN` to have access to the system.

1. Create an account at [app.serverlessq.com](https://app.serverlessq.com) and follow the steps described in our [documentation](https://docs.serverlessq.com/sdks/javascript) to get the API token.

> 🔜 you can also use our Vercel Integration to automate that task 🙂

If you want to use this library locally please create `.env.local` file (for next.js) with the following value:

```bash
SERVERLESSQ_API_TOKEN=
```

New for you? Go check out the official next.js docs on [how to create env files in NextJS](https://nextjs.org/docs/basic-features/environment-variables)

<br/>

## Usage

```typescript
import { EnqueueOptions, Queue } from '@serverlessq/nextjs'

const queue = new Queue(queueId)

const options: EnqueueOptions = {
  method: 'GET',
  target: TARGET_URL || 'https://mock.codes/200'
}

const response = await queue.enqueue(options)
```

Create an instance of the class `Queue` with the queue ID. You get the queue ID from your [ServerlessQ](https://app.serverlessq.com/queue) system.

<br/>

## Milestone

- [x] Enqueue messages with the SQS
- [ ] Allow dynamic queue creation
- [ ] Add the option for advanced queue options e.g. filter, tags

<br/>

## License

The MIT License.
