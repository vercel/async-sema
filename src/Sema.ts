import { EventEmitter } from 'node:events';
import { Deque } from './Deque';

const DEFAULT_INIT_VALUE = '1';

function isFn(x: unknown) {
  return typeof x === 'function';
}

export class Sema<T = string> {
  private maxConcurrency: number;

  private freeQ: Deque<T>;

  private waitingQ: Deque<{
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: string) => void;
  }>;

  private releaseEmitter: EventEmitter;

  private noTokens: boolean;

  private pauseFn?: () => void;

  private resumeFn?: () => void;

  private paused: boolean;

  constructor(
    maxConcurrency: number,
    {
      initFn,
      pauseFn,
      resumeFn,
      capacity = 10,
    }: {
      initFn?: () => T;
      pauseFn?: () => void;
      resumeFn?: () => void;
      capacity?: number;
    } = {},
  ) {
    if (isFn(pauseFn) !== isFn(resumeFn)) {
      throw new Error('pauseFn and resumeFn must be both set for pausing');
    }

    this.maxConcurrency = maxConcurrency;
    this.freeQ = new Deque(maxConcurrency);
    this.waitingQ = new Deque(capacity);
    this.releaseEmitter = new EventEmitter();
    this.noTokens = initFn == null;
    this.pauseFn = pauseFn;
    this.resumeFn = resumeFn;
    this.paused = false;

    this.releaseEmitter.on('release', (token: T) => {
      const p = this.waitingQ.shift();

      if (p) {
        p.resolve(token);
      } else {
        if (this.resumeFn && this.paused) {
          this.paused = false;
          this.resumeFn();
        }

        this.freeQ.push(token);
      }
    });

    for (let i = 0; i < maxConcurrency; i += 1) {
      const init: T = initFn ? initFn() : (DEFAULT_INIT_VALUE as T);

      this.freeQ.push(init);
    }
  }

  tryAcquire(): T | void {
    return this.freeQ.pop();
  }

  async acquire(): Promise<T> {
    const token = this.tryAcquire();

    if (token !== undefined) {
      return token;
    }

    return new Promise<T>((resolve, reject) => {
      if (this.pauseFn && !this.paused) {
        this.paused = true;
        this.pauseFn();
      }

      this.waitingQ.push({ resolve, reject });
    });
  }

  release(token?: T): void {
    this.releaseEmitter.emit('release', this.noTokens ? DEFAULT_INIT_VALUE : token);
  }

  drain(): Promise<T[]> {
    const a = new Array<Promise<T>>(this.maxConcurrency);

    for (let i = 0; i < this.maxConcurrency; i += 1) {
      a[i] = this.acquire();
    }

    return Promise.all(a);
  }

  waiting(): number {
    return this.waitingQ.length;
  }
}
