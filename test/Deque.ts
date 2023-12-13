import { Deque, MAX_CAPACITY, getCapacity } from '../src/Deque';

describe('MAX_CAPACITY', () => {
  it('should restrict max capacity to 1gb', () => {
    expect(MAX_CAPACITY).toBe(1073741824);
  });
});

describe('getCapacity', () => {
  it('should accept a initial capacity for the queue, with a default of 4 if passed value is less than 4', () => {
    const d = getCapacity(2);

    expect(d).toBe(4);
  });

  it('should increment the capacity through a bit shift for every value greater than the previous bit shift limit', () => {
    const d1 = getCapacity(5);

    expect(d1).toBe(8);

    const d2 = getCapacity(17);

    expect(d2).toBe(32);
  });

  it('should restrict capcity to max buffer size (MAX_CAPACITY)', () => {
    const d1 = getCapacity(MAX_CAPACITY + 1);

    expect(d1).toBe(MAX_CAPACITY);
  });
});

describe('Deque.constructor', () => {
  it('should accept no arguments and default to a capacity of 4', () => {
    const d = new Deque();

    /* eslint-disable @typescript-eslint/ban-ts-comment, no-underscore-dangle */

    // @ts-expect-error
    expect(d._capacity).toBe(4);

    // @ts-expect-error
    expect(d._length).toBe(0);

    // @ts-expect-error
    expect(d.arr.length).toBe(0);

    // @ts-expect-error
    expect(d._front).toBe(0);

    /* eslint-enable */
  });

  it('should accept a capacity argument', () => {
    const d = new Deque(32);

    /* eslint-disable @typescript-eslint/ban-ts-comment, no-underscore-dangle */

    // @ts-expect-error
    expect(d._capacity).toBe(32);

    // @ts-expect-error
    expect(d._length).toBe(0);

    // @ts-expect-error
    expect(d.arr.length).toBe(0);

    // @ts-expect-error
    expect(d._front).toBe(0);

    /* eslint-enable */
  });

  it('should default to 4 capacity if capacity passed is lesser', () => {
    const d = new Deque(2);

    /* eslint-disable @typescript-eslint/ban-ts-comment, no-underscore-dangle */

    // @ts-expect-error
    expect(d._capacity).toBe(4);

    // @ts-expect-error
    expect(d._length).toBe(0);

    // @ts-expect-error
    expect(d.arr.length).toBe(0);

    // @ts-expect-error
    expect(d._front).toBe(0);

    /* eslint-enable */
  });
});

describe('Deque.push', () => {
  it('should accept an item to add to the queue and increment the length', () => {
    const d = new Deque();

    d.push(1);

    expect(d.length).toBe(1);
  });

  it('should update capacity if more than capacity items are added', () => {
    const d = new Deque();

    d.push(1);
    d.push(1);
    d.push(1);
    d.push(1);
    const finalLength = d.push(1);

    expect(finalLength).toBe(5);
    expect(d.length).toBe(5);

    /* eslint-disable @typescript-eslint/ban-ts-comment, no-underscore-dangle */

    // @ts-expect-error
    expect(d._capacity).toBe(8);

    // @ts-expect-error
    expect(d.arr).toMatchObject([1, 1, 1, 1, 1]);

    /* eslint-enable */
  });
});
