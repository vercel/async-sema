import { Sema } from '../src/index';

test('s.nrWaiting() is sane', async () => {
	const s = new Sema(1);

	await s.acquire();
	expect(s.nrWaiting()).toEqual(0);

	// This would block with await
	s.acquire().catch(console.error);
	expect(s.nrWaiting()).toEqual(1);

	s.release();
	expect(s.nrWaiting()).toEqual(0);
	s.release();
	expect(s.nrWaiting()).toEqual(0);
});

test('nr of available semas seems correct', async () => {
	const s = new Sema(3);

	await s.acquire();
	expect(s.nrWaiting()).toEqual(0);

	await s.acquire();
	expect(s.nrWaiting()).toEqual(0);

	await s.acquire();
	expect(s.nrWaiting()).toEqual(0);
});

test('tryAcquire returns undefined', async () => {
	const s = new Sema(2);

	await s.acquire();
	expect(s.tryAcquire()).toBeDefined();
	expect(s.tryAcquire()).toBeUndefined();

	s.release();
	expect(s.tryAcquire()).toBeDefined();
	expect(s.tryAcquire()).toBeUndefined();
});

test('Pausing works', () => {
	const pauseFn = jest.fn();
	const resumeFn = jest.fn();
	const s = new Sema(5, { pauseFn, resumeFn });

	for (let i = 0; i < 5; i++) {
		s.acquire().catch(console.error);
	}

	expect(pauseFn).not.toHaveBeenCalled();
	expect(resumeFn).not.toHaveBeenCalled();

	s.acquire().catch(console.error);
	expect(pauseFn).toHaveBeenCalled();
	s.release();
	s.release();
	expect(resumeFn).toHaveBeenCalled();
});

test('initFn is called properly', () => {
	const initFn = jest.fn(() => 't');
	new Sema(3, { initFn });

	expect(initFn).toHaveReturnedTimes(3);
});

test('Tokens are returned properly', async () => {
	let nrTokens = 0;
	const s = new Sema(3, {
		initFn: () => nrTokens++,
	});

	const tokens = await Promise.all([s.acquire(), s.acquire(), s.acquire()]);
	expect(tokens).toEqual(expect.arrayContaining([0, 1, 2]));
});
