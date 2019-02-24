#!/usr/bin/env node

const { RateLimit } = require('async-sema');

async function f() {
	console.log('Naive requests per second rate limiting');

	const n = 50;
	const lim = RateLimit(5);
	const start = process.hrtime();

	for (let i = 0; i < n; i++) {
		await lim();
		process.stdout.write('.');
	}
	process.stdout.write('\n');

	const hrt = process.hrtime(start);
	const elapsed = (hrt[0] * 1000 + hrt[1] / 1e6) / 1000;
	const rps = n / elapsed;
	console.log(rps.toFixed(3) + ' req/s');
}

async function g() {
	console.log('Custom rate limit time unit');

	const n = 20;
	const lim = RateLimit(5, { timeUnit: 60 * 1000 });
	const start = process.hrtime();

	for (let i = 0; i < n; i++) {
		await lim();
		process.stdout.write('.');
	}
	process.stdout.write('\n');

	const hrt = process.hrtime(start);
	const elapsed = (hrt[0] * 1000 + hrt[1] / 1e6) / 1000;
	const rps = n / (elapsed / 60);
	console.log(rps.toFixed(3) + ' req/min');
}

async function h() {
	console.log('Uniform distribution of requests over time');
	const n = 50;
	const lim = RateLimit(5, { uniformDistribution: true });
	const start = process.hrtime();

	for (let i = 0; i < n; i++) {
		await lim();
		process.stdout.write('.');
	}
	process.stdout.write('\n');

	const hrt = process.hrtime(start);
	const elapsed = (hrt[0] * 1000 + hrt[1] / 1e6) / 1000;
	const rps = n / elapsed;
	console.log(rps.toFixed(3) + ' req/s');
}

f()
	.then(g)
	.then(h)
	.catch(e => console.log(e))
	.then(() => console.log('READY'));
