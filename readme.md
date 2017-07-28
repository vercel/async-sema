# async-sema

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![Slack Channel](http://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)

This is a semaphore implementation for use with async-await. The implementation
follows the traditional definition of a semaphore rather than the definition of
an asynchronous semaphore. Where as the latter one generally allows every
defined task to proceed immediately and synchronizes at the end, async-sema
allows only a selected number of tasks to proceed at once while the rest will
remain waiting.

Async-sema manages the semaphore count as a list of tokens instead of a single
variable containing the nuber of available resources. This enables an
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

## Author

Olli Vanhoja ([@OVanhoja](https://twitter.com/OVanhoja)) - [▲ZEIT](https://zeit.co)
