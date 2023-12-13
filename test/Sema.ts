import { Sema } from '../src/index';

describe('General', () => {
  test('Pausing works', () => {
    const pauseFn = jest.fn();
    const resumeFn = jest.fn();
    const s = new Sema(5, { pauseFn, resumeFn });

    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line
      s.acquire().catch(console.error);
    }

    expect(pauseFn).not.toHaveBeenCalled();
    expect(resumeFn).not.toHaveBeenCalled();

    // eslint-disable-next-line
    s.acquire().catch(console.error);
    expect(pauseFn).toHaveBeenCalled();
    s.release();
    s.release();
    expect(resumeFn).toHaveBeenCalled();
  });

  test('initFn is called properly', () => {
    const initFn = jest.fn(() => 't');
    const s = new Sema(3, { initFn });

    expect(s).toBeInstanceOf(Sema);
    expect(initFn).toHaveReturnedTimes(3);
  });

  test('Tokens are returned properly', async () => {
    let maxConcurrency = 0;

    const s = new Sema(3, {
      initFn: () => {
        maxConcurrency += 1;

        return maxConcurrency;
      },
    });

    const tokens = await Promise.all([s.acquire(), s.acquire(), s.acquire()]);

    expect(tokens).toEqual(expect.arrayContaining([1, 2, 3]));
  });
});

describe('Sema.acquire', () => {
  it('should aquire a sephamore', async () => {
    const s = new Sema(1);

    const token = await s.acquire();

    expect(token).toBe('1');
    expect(s.waiting()).toEqual(0);
  });
});

describe('Sema.tryAcquire', () => {
  it('should return undefined no sephamores are free', async () => {
    const s = new Sema(1);

    await s.acquire();

    expect(s.tryAcquire()).toBeUndefined();
  });
});

describe('Sema.release', () => {
  it('should add the available free semaphores', () => {
    const s = new Sema(1);

    expect(s.tryAcquire()).toBeDefined();

    s.release();

    expect(s.tryAcquire()).toBeDefined();
    expect(s.tryAcquire()).toBeUndefined();
  });
});

describe('Sema.waiting', () => {
  it('should return zero waiting clients', async () => {
    const s = new Sema(1);

    await s.acquire();

    expect(s.waiting()).toEqual(0);
  });

  it('should return the number of waiting clients', async () => {
    const s = new Sema(1);

    await s.acquire();

    // This would block with await
    // eslint-disable-next-line
    s.acquire().catch(console.error);

    expect(s.waiting()).toEqual(1);
  });

  it('should have no waiting clients after releaseing outstanding requests', async () => {
    const s = new Sema(1);

    await s.acquire();

    // This would block with await
    // eslint-disable-next-line
    s.acquire().catch(console.error);

    s.release();

    expect(s.waiting()).toEqual(0);
  });

  it('should still have no waiting clients after releasing outstanding requests more than once', async () => {
    const s = new Sema(1);

    await s.acquire();

    // This would block with await
    // eslint-disable-next-line
    s.acquire().catch(console.error);

    s.release();
    s.release();

    expect(s.waiting()).toEqual(0);
  });

  it('should hanlde greater maxConcurrency', async () => {
    const s = new Sema(3);

    await s.acquire();
    expect(s.waiting()).toEqual(0);

    await s.acquire();
    expect(s.waiting()).toEqual(0);

    await s.acquire();
    expect(s.waiting()).toEqual(0);
  });
});
