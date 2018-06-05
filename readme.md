# async-sema

This is a semaphore implementation for use with `async` and `await`. The implementation
follows the traditional definition of a semaphore rather than the definition of
an asynchronous semaphore. Where as the latter one generally allows every
defined task to proceed immediately and synchronizes at the end, async-sema
allows only a selected number of tasks to proceed at once while the rest will
remain waiting.

Async-sema manages the semaphore count as a list of tokens instead of a single
variable containing the number of available resources. This enables an
interesting application of managing the actual resources with the semaphore
object itself. To make it practical the constructor for Sema includes an option
for providing an init function for the semaphore tokens. Use of a custom token
initializer is demonstrated in `example1.js`.

## Usage

Firstly, add the package to your project's `dependencies`:

```bash
npm install --save async-sema
```

Then start using it like shown [here](./examples).

## Example
See [/examples](./examples) for more use cases.
```js
const Sema = require('async-sema')

function getRnd (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function f () {
  const arr = []

  for (let i = 0; i < 100; i++)
  arr.push(i + 1)

  const s = new Sema(13, { capacity: arr.length })
  await Promise.all(arr.map(async (elem) => {
    await s.acquire()
    console.log(elem, s.nrWaiting())
    await new Promise((resolve) => setTimeout(resolve, getRnd(500, 3000)))
    s.release()
  }))

  console.log('hello')
}

f().catch((e) => console.log(e)).then(() => console.log('READY'))
```


## Contributing

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Move into the directory of the clone: `cd async-sema`
3. Link it to the global module directory of Node.js: `npm link`

Inside the project where you want to test your clone of the package, you can now either use `npm link async-sema` to link the clone to the local dependencies.

## Author

Olli Vanhoja ([@OVanhoja](https://twitter.com/OVanhoja)) - [▲ZEIT](https://zeit.co)
