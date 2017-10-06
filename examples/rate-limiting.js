#!/usr/bin/env node

const Sema = require('../index.js')

function rateLimit(rps) {
  const sema = new Sema(rps);

  return async function rl() {
    await sema.v();
    setTimeout(() => sema.p(), 1000);
  }
}

const lim = rateLimit(5);

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
