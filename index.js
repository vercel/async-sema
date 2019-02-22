// Native
const EventEmitter = require('events')
const util = require('util')

var isArray = Array.isArray;

// Deque is based on https://github.com/petkaantonov/deque/blob/master/js/deque.js
// Released under the MIT License: https://github.com/petkaantonov/deque/blob/6ef4b6400ad3ba82853fdcc6531a38eb4f78c18c/LICENSE
function Deque(capacity) {
    this._capacity = getCapacity(capacity);
    this._length = 0;
    this._front = 0;
    if (isArray(capacity)) {
        var len = capacity.length;
        for (var i = 0; i < len; ++i) {
            this[i] = capacity[i];
        }
        this._length = len;
    }
}

Deque.prototype.push = function Deque$push(item) {
    var argsLength = arguments.length;
    var length = this._length;
    if (argsLength > 1) {
        var capacity = this._capacity;
        if (length + argsLength > capacity) {
            for (var i = 0; i < argsLength; ++i) {
                this._checkCapacity(length + 1);
                var j = (this._front + length) & (this._capacity - 1);
                this[j] = arguments[i];
                length++;
                this._length = length;
            }
            return length;
        }
        else {
            var j = this._front;
            for (var i = 0; i < argsLength; ++i) {
                this[(j + length) & (capacity - 1)] = arguments[i];
                j++;
            }
            this._length = length + argsLength;
            return length + argsLength;
        }

    }

    if (argsLength === 0) return length;

    this._checkCapacity(length + 1);
    var i = (this._front + length) & (this._capacity - 1);
    this[i] = item;
    this._length = length + 1;
    return length + 1;
};

Deque.prototype.pop = function Deque$pop() {
    var length = this._length;
    if (length === 0) {
        return void 0;
    }
    var i = (this._front + length - 1) & (this._capacity - 1);
    var ret = this[i];
    this[i] = void 0;
    this._length = length - 1;
    return ret;
};

Deque.prototype.shift = function Deque$shift() {
    var length = this._length;
    if (length === 0) {
        return void 0;
    }
    var front = this._front;
    var ret = this[front];
    this[front] = void 0;
    this._front = (front + 1) & (this._capacity - 1);
    this._length = length - 1;
    return ret;
};

Object.defineProperty(Deque.prototype, "length", {
    get: function() {
        return this._length;
    },
    set: function() {
        throw new RangeError("");
    }
});

Deque.prototype._checkCapacity = function Deque$_checkCapacity(size) {
    if (this._capacity < size) {
        this._resizeTo(getCapacity(this._capacity * 1.5 + 16));
    }
};

Deque.prototype._resizeTo = function Deque$_resizeTo(capacity) {
    var oldCapacity = this._capacity;
    this._capacity = capacity;
    var front = this._front;
    var length = this._length;
    if (front + length > oldCapacity) {
        var moveItemsCount = (front + length) & (oldCapacity - 1);
        arrayMove(this, 0, this, oldCapacity, moveItemsCount);
    }
};

function arrayMove(src, srcIndex, dst, dstIndex, len) {
    for (var j = 0; j < len; ++j) {
        dst[j + dstIndex] = src[j + srcIndex];
        src[j + srcIndex] = void 0;
    }
}

function pow2AtLeast(n) {
    n = n >>> 0;
    n = n - 1;
    n = n | (n >> 1);
    n = n | (n >> 2);
    n = n | (n >> 4);
    n = n | (n >> 8);
    n = n | (n >> 16);
    return n + 1;
}

function getCapacity(capacity) {
    if (typeof capacity !== "number") {
        if (isArray(capacity)) {
            capacity = capacity.length;
        }
        else {
            return 16;
        }
    }
    return pow2AtLeast(
        Math.min(
            Math.max(16, capacity), 1073741824)
    );
}

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
