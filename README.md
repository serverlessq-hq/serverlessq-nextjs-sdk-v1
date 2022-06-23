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

## Environment Variables

This library only works when using the ServerlessQ platform. There are two ways to obtain your environment variables

1. Create an account at [app.serverlessq.com](https://app.serverlessq.com) and follow the steps described in our [documentation](https://docs.serverlessq.com/serverlessQ/getting-started) to get the queue id and your api token.
2. Use our [Vercel Integration](https://vercel.com/integrations/serverlessq) to automatically create a queue and add the desired env vars to your Vercel scope.

You need to create a `.env.local` with the following values to use the queue properly.
```bash
SERVERLESSQ_QUEUE_ID=
SERVERLESSQ_API_TOKEN=
```

New for you? Go check out the official NextJS docs on [how to create env files in NextJS](https://nextjs.org/docs/basic-features/environment-variables)

<br/>

## Usage

Import is possible through named and default exports.
```typescript
import SlsQ, { queue, EnqueuOptions } from "@serverlessq/nextjs";

const options: EnqueuOptions = {
    method: "GET",
    target: "https://jsonplaceholder.typicode.com/users",
  };

const response = await queue.enqueue(options);
const response = await SlsQ.enqueue(options);
```

<br/>

## Milestone
- [x] Build wrapper around ServerlessQ
- [ ] Allow dynamic queue creation
- [ ] Add the option for advanced queue options e.g. filter, tags


<br/>

## License

The MIT License.