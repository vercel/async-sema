#!/usr/bin/env node

const RateLimit = require('async-sema/rate-limit')
const lim = RateLimit(5);

async function f() {
  const n = 50;
  const start = process.hrtime();

  for (let i = 0; i < n; i++) {
    await lim();
    process.stdout.write('.');
  }
  process.stdout.write('\n');

  const hrt = process.hrtime(start);
  const elapsed = (hrt[0] * 1000 + hrt[1] / 1e6) / 1000;
  const rps = n / elapsed;
  console.log(rps.toFixed(3) + " rps");
}

f().catch((e) => console.log(e)).then(() => console.log('READY'))
