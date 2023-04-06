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

`@serverlessQ/nextjs` is a lightweight wrapper to easily utilize the managed queue by [ServerlessQ](https://serverlessq.com).

The SDK is for NextJS projects deployed on Vercel and makes use of Vercel environment variables.

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

> 💡 you can also use our [Vercel Integration](https://vercel.com/integrations/serverlessq)to automate that task 🙂

If you want to use this library locally please create `.env.local` file with the following value:

```bash
SERVERLESSQ_API_TOKEN=
```

New for you? Go check out the official next.js docs on [how to create env files in NextJS](https://nextjs.org/docs/basic-features/environment-variables)

<br/>

## Setup the SDK
Within your `next.config.js` file you need to add the following code:

```ts
const { withServerlessQ } = require('@serverlessq/nextjs')


module.exports = withServerlessQ({
  // your nextjs config
})
```

What does this do? If you are running your NextJS application locally e.g. through `next dev` it will start to watch the `/api` folder for changes. If you import a queue or cron it will automatically create the corresponding API function for you and will update their settings on save. In order to prevent to override production queues/crons it will only create the corresponding resources with a prefix `DEV_` if you are running your application locally. If you create a production build through `next build` it will create the resources without the prefix.

![Alt text](./assets/sdk.png)

## Queue
### Create a Queue from an API Function

Create a new [API Route](https://nextjs.org/docs/api-routes/introduction) within your NextJS application, e.g. `pages/api/queue`.

You can have several queues in multiple queue functions.

```ts
// pages/api/queue
export default Queue({
    options: {
        name: 'SendNewsletter',
        retries: 2,
        urlToOverrideWhenRunningLocalhost: 'https://5923-2001-16b8-2ad0-1a00-830-bf28-256f-a5ae.eu.ngrok.io/api/queue'
    },
    handler: (req, res) => {
        res.status(200).json({ name: 'John Doe' })
    }
})
```

<br/>

### Enqueue Jobs

You can now easily enqueue jobs by importing your created queue and simple call `.enqueue(...)`.

You can do this either from `getServerSideProps` or from another API function.

```ts
// pages/api/enqueue or getServerSideProps
import { NextApiRequest, NextApiResponse } from 'next'
import testQueue from './queue'

export default async function enqueue(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await testQueue.enqueue({ method: 'GET' })
    res.json({ status: 'success', ...result })
  } catch (e) {
    res.json({ status: 'failed' })
  }
}
```

## Crons

### Create a Cronjob from an API Function

```ts
import { Cron } from '@serverlessq/nextjs'

// pages/api/cleanup
export default Cron({
    options: {
        name: 'CleanupDb',
        retries: 3,
        expression: '0 0 0 * * *', // every day at midnight
        target: 'https://5923-2001-16b8-2ad0-1a00-830-bf28-256f-a5ae.eu.ngrok.io/api/queue'
    },
    handler: (req, res) => {
        // do something
        res.status(200).json({ status: 'OK' })
    }
})
```

<br/>

## Types

We have full TypeScript support of course ✨

## Local Development

ServerlessQ runs on the cloud. That means if you work locally on a queue and want to test enqueueing jobs you need to override the parameter `urlToOverrideWhenRunningLocalhost` in the queue options.
This url will only be used if the environment variable `VERCEL` is not set. You can use a service such as [ngrok](https://ngrok.com/). Ngrok gives you a deployed
Webhook URL and you can run a local CLI which listens to all of these incoming requests. This is a great way to test your queue.

If you need help with that please contact us! 💬

## Working with Existing Queues

You have also the opportunity to work with existing queues. If you have created a queue from the ServerlessQ UI and simply want to forward messages you can do that.

```ts
// pages/api/existingQueue
import { enqueue } from "@serverlessq/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await enqueue({
      target: // TARGET URL,
      method: // HTTP METHOD,
      queueId: // QUEUE-ID,
    });
    res.json({ status: "success", ...result });
  } catch (e) {
    res.json({ status: "failed" });
  }
}
```

You can use the `enqueue` function to directly enqueue a job to a certain `Queue-ID`.

## Milestone

- [x] Enqueue messages with ServerlessQ
- [x] Build Wrapper for NextJS API Routes
- [x] Allow dynamic queue creation
- [x] Allow dynamic creation of cron jobs
- [ ] Implement a local proxy for testing queues and crons
- [ ] Add the option for advanced queue options e.g. filter, tags

<br/>

## License

The MIT License.
