# sema4

<p align="center">
   <a href="https://github.com/jdalrymple/sema4/actions/workflows/pipeline.yml"><img alt="pipeline status" src="https://github.com/jdalrymple/sema4/actions/workflows/pipeline.yml/badge.svg"/></a>
   <a href="https://codeclimate.com/github/jdalrymple/sema4/test_coverage"><img alt="coverage report" src="https://api.codeclimate.com/v1/badges/e826c4088ed7bed3bae6/test_coverage" /></a>
  <a href="https://codeclimate.com/github/jdalrymple/sema4/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/e826c4088ed7bed3bae6/maintainability" alt="Code Climate maintainability">
  </a>
  <a href="https://github.com/intuit/auto">
    <img src="https://img.shields.io/badge/release-auto.svg?colorA=888888&colorB=9B065A&label=auto" alt="Auto">
  </a>
  <a href="#contributors-">
    <img src="https://img.shields.io/badge/all_contributors-orange.svg?style=round" alt="All Contributors" />
  </a>
  <img src="https://img.shields.io/badge/code%20style-prettier-ff69b4.svg" alt="Prettier">
  <a href="LICENSE.md">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="Licence: MIT">
  </a>
</p>

> A semaphore implementation using promises. Forked from [vercel/async-sema](https://github.com/vercel/async-sema/).

## Table of Contents

- [Usage](#usage)
- [API](#api)
- [Examples](#examples)
- [Contributors](#contributors)
- [Changelog](./CHANGELOG.md)

## Features

- **Universal** - Works in all modern browsers, [Node.js](https://nodejs.org/), and [Deno](https://deno.land/) and supports [CLI](https://www.npmjs.com/package/@gitbeaker/cli) usage.
- **Zero Dependencies** - Absolutely no dependencies, keeping the package tiny (24kb).
- **Tested** - Greater than 85% test coverage.
- **Typed** - Out of the box TypeScript declarations.

## Usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>
Load <code>sema4</code> directly from <a href="https://esm.sh">esm.sh</a>

```html
<script type="module">
  import { Sema } from 'https://esm.sh/sema4';
</script>
```

</td></tr>
<tr><th>
Deno
</th><td width=100%>
Load <code>sema4</code> directly from <a href="https://esm.sh">esm.sh</a>

```ts
import { Sema } from 'https://esm.sh/sema4?dts';
```

</td></tr>
<tr><th>
Node 18+
</th><td>

Install with <code>npm install sema4</code>, or <code>yarn add sema4</code>

```js
import { Sema } from 'sema4';
```

</td></tr>
</tbody>
</table>

## API

### Sema

#### Constructor(maxConcurrency, { initFn, pauseFn, resumeFn, capacity })

| Name               | Type     | Optional | Default              | Description                                                                                                                                                                                                      |
| ------------------ | -------- | -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxConcurrency`   | Integer  | No       | `https://gitlab.com` | The maximum number of callers allowed to acquire the semaphore concurrently                                                                                                                                      |
| `options.initFn`   | Function | Yes      | `() => '1'`          | The function that is used to initialize the tokens used to manage the semaphore                                                                                                                                  |
| `options.pauseFn`  | Function | Yes\*    |                      | The function that is called to opportunistically request pausing the incoming stream of data, instead of piling up waiting promises and possibly running out of memory                                           |
| `options.resumeFn` | Function | Yes\*    | N/A                  | The function that is called when there is room again to accept new waiters on the semaphore. This function must be declared if a `pauseFn` is declared                                                           |
| `options.capacity` | Integer  | Yes      | 10                   | Sets the size of the pre-allocated waiting list inside the semaphore. This is typically used by high performance where the developer can make a rough estimate of the number of concurrent users of a semaphore. |

#### `async sema.drain()`

Drains the semaphore and returns all the initialized tokens in an array. Draining is an ideal way to ensure there are no pending async tasks, for example before a process will terminate.

#### `sema.waiting()`

Returns the number of callers waiting on the semaphore, i.e. the number of pending promises.

#### `sema.tryAcquire()`

Attempt to acquire a token from the semaphore, if one is available immediately. Otherwise, return `undefined`.

#### `async sema.acquire()`

Acquire a token from the semaphore, thus decrement the number of available execution slots. If `initFn` is not used then the return value of the function can be discarded.

#### `sema.release(token)`

Release the semaphore, thus increment the number of free execution slots. If `initFn` is used then the `token` returned by `acquire()` should be given as an argument when calling this function.

#### `createRateLimiter(rptu, { timeUnit, uniformDistribution })`

Creates a rate limiter function that blocks with a promise whenever the rate limit is hit and resolves the promise once the call rate is within the limit.

| Name                          | Type    | Optional | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------- | ------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rptu`                        | Integer | No       |         | Number of tasks allowed per `timeUnit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `options.timeUnit`            | Integer | Yes      | 1000    | Defines the width of the rate limiting window in milliseconds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `options.uniformDistribution` | Boolean | Yes      | False   | Enforces a discrete uniform distribution over time. Setting the `uniformDistribution` option is mainly useful in a situation where the flow of rate limit function calls is continuous and and occurring faster than `timeUnit` (e.g. reading a file) and not enabling it would cause the maximum number of calls to resolve immediately (thus exhaust the limit immediately) and therefore the next bunch of calls would need to wait for `timeUnit` milliseconds. However if the flow is sparse then this option may make the code run slower with no advantages. |

## Examples

```js
import { Sema } from 'sema4';

function foo() {
  const s = new Sema(
    4, // Allow 4 concurrent async calls
    {
      capacity: 100, // Preallocated space for 100 tokens
    },
  );

  async function fetchData(x) {
    await s.acquire();

    try {
      console.log(s.waiting() + ' calls to fetch are waiting');
      // Perform some async tasks here...
    } finally {
      s.release();
    }
  }

  return Promise.all(array.map(fetchData));
}
```

```js
import { RateLimit } from 'sema4';

async function bar() {
  const lim = RateLimit(5); // Limit to 5 tasks per default timeUnit

  for (let i = 0; i < n; i++) {
    await lim();
    // Perform some async tasks here...
  }
}
```

## Contributors

In addition to the contributors of the parent repository [vercel/async-sema](https://github.com/vercel/async-sema), these lovely people have helped keep this library going.

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<p>
    <tr>
      <td align="center" valign="top" width="3.84%"><a href="https://github.com/jdalrymple"><img src="https://images.weserv.nl/?url=https://avatars3.githubusercontent.com/u/3743662?v=4&h=25&w=25&fit=cover&mask=circle&maxage=7d" alt="Justin Dalrymple"/></td>
    </tr>
</p>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
