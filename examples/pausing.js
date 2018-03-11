#!/usr/bin/env node

// Usage ./third.js < VERY_LARGE_FILE

const Sema = require('async-sema')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

function pause() {
  console.log('Pausing the stream')
  rl.pause();
}

function resume() {
  console.log('Resuming the stream')
  rl.resume();
}

const s = new Sema(5, { pauseFn: pause, resumeFn: resume })
async function parse(line) {
  await s.acquire()

  console.log(line)

  s.release()
}

rl.on('line', (line) => {
  parse(line).catch(console.error)
})
