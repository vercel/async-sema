#!/bin/sh
// >&/dev/null;exec node --harmony_async_await $0 $@

const Sema = require('./index.js')

function getRnd (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function f () {
  const arr = []

  for (let i = 0; i < 100; i++)
  arr.push(i + 1)

  const s = new Sema(13, { capacity: arr.length })
  await Promise.all(arr.map(async (elem) => {
    await s.v()
    console.log(elem, s.nrWaiting())
    await new Promise((resolve) => setTimeout(resolve, getRnd(500, 3000)))
    s.p()
  }))
  console.log('hello')
}
f().catch((e) => console.log(e)).then(() => console.log('READY'))
