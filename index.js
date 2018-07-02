// Native
const EventEmitter = require('events')
const util = require('util')

// Packages
const Deque = require('double-ended-queue')

class ReleaseEmitter extends EventEmitter {}

function isFn (x) {
  return typeof x === 'function'
}

function defaultInit () {
  return '1'
}

class Sema {
  constructor (nr, { initFn = defaultInit, pauseFn, resumeFn, capacity = 10 } = {}) {
    if (isFn(pauseFn) ^ isFn(resumeFn)) {
      throw new Error('pauseFn and resumeFn must be both set for pausing')
    }

    this.nrTokens = nr
    this.free = new Deque(nr)
    this.waiting = new Deque(capacity)
    this.releaseEmitter = new ReleaseEmitter()
    this.noTokens = initFn === defaultInit
    this.pauseFn = pauseFn
    this.resumeFn = resumeFn

    this.releaseEmitter.on('release', (token) => {
      const p = this.waiting.shift()
      if (p) {
        p.resolve(token)
      } else {
        if (this.resumeFn && this.paused) {
          this.paused = false
          this.resumeFn()
        }

        this.free.push(token)
      }
    })

    for (let i = 0; i < nr; i++) {
      this.free.push(initFn())
    }
  }

  async acquire () {
    let token = this.free.pop()

    if (token) {
      return token
    }

    return new Promise((resolve, reject) => {
      if (this.pauseFn && !this.paused) {
        this.paused = true
        this.pauseFn()
      }

      this.waiting.push({ resolve, reject })
    })
  }
  async v () {
    return this.acquire();
  }

  release (token) {
    this.releaseEmitter.emit('release', this.noTokens ? '1' : token)
  }
  p (token) {
    return this.release(token)
  }

  drain () {
    const a = new Array(this.nrTokens)
    for (let i = 0; i < this.nrTokens; i++) {
      a[i] = this.acquire()
    }
    return Promise.all(a)
  }

  nrWaiting () {
    return this.waiting.length
  }
}

Sema.prototype.v = util.deprecate(Sema.prototype.v, '`v()` is deperecated; use `acquire()` instead')
Sema.prototype.p = util.deprecate(Sema.prototype.p, '`p()` is deprecated; use `release()` instead')
module.exports = Sema
