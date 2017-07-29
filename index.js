// Native
const EventEmitter = require('events')

// Packages
const Deque = require('double-ended-queue')

class ReleaseEmitter extends EventEmitter {}

function defaultInit () {
  return '1'
}

class Sema {
  constructor (nr, { initFn, capacity }) {
    initFn = initFn || defaultInit
    capacity = capacity || 10

    this.nrTokens = nr
    this.free = new Deque(nr)
    this.waiting = new Deque(capacity)
    this.releaseEmitter = new ReleaseEmitter()
    this.noTokens = initFn === defaultInit

    this.releaseEmitter.on('release', (token) => {
      const p = this.waiting.shift()
      if (p) {
        p.resolve(token)
      } else {
       this.free.push(token)
      }
    })

    for (let i = 0; i < nr; i++) {
      this.free.push(initFn())
    }
  }

  async v () {
    let token = this.free.pop()
    if (token)
      return token

    return new Promise((resolve, reject) => {
      this.waiting.push({ resolve, reject })
    })
  }

  p (token) {
    this.releaseEmitter.emit('release', this.noTokens ? '1' : token)
  }

  drain () {
    const a = new Array(this.nrTokens)
    a.fill(this.v())
    return Promise.all(a)
  }

  nrWaiting () {
    return this.waiting.length
  }
}

module.exports = Sema
