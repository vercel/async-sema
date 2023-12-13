import { Sema } from '../src/Sema';

import { createRateLimiter } from '../src/Utils';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

const acquireFn = jest.fn();
const releaseFn = jest.fn();

jest.mock('../src/Sema', () => {
  return {
    Sema: jest.fn(() => ({
      acquire: acquireFn,
      release: releaseFn,
    })),
  };
});

describe('General', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Sema instance with one maxConcurrency if uniform distribution is true', () => {
    createRateLimiter(3, { uniformDistribution: true });

    expect(Sema).toHaveBeenCalledWith(1);
  });

  it('should create a Sema instance with passed maxConcurrency if uniform distribution is false', () => {
    createRateLimiter(3, { uniformDistribution: false });

    expect(Sema).toHaveBeenCalledWith(3);
  });

  it('should create a Sema instance with passed maxConcurrency if a uniform distribution is not passed', () => {
    createRateLimiter(3);

    expect(Sema).toHaveBeenCalledWith(3);
  });

  it('should create a timeout using default timeUnit as delay if uniformDistribution is not passed', async () => {
    const limiter = createRateLimiter(3);

    await limiter();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('should create a timeout using passed timeUnit as delay if uniformDistribution is not passed', async () => {
    const limiter = createRateLimiter(3, { timeUnit: 2000 });

    await limiter();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
  });

  it('should create a timeout using passed timeUnit as delay if uniformDistribution is false', async () => {
    const limiter = createRateLimiter(3, { uniformDistribution: false, timeUnit: 2000 });

    await limiter();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
  });

  it('should create a timeout using passed timeUnit divided by requests per time unit if uniformDistribution is true', async () => {
    const limiter = createRateLimiter(2, { uniformDistribution: true, timeUnit: 10000 });

    await limiter();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });

  it('should call Sema.aquire in limiter function', async () => {
    const limiter = createRateLimiter(2);

    await limiter();

    expect(acquireFn).toHaveBeenCalledTimes(1);
  });
});
