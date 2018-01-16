#!/usr/bin/env node

const Sema = require('async-sema')
const redis = require('promise-redis')

async function f () {
  const red = new Sema(3, { initFn: () => redis().createClient(process.env.REDIS_URL) })

  const db = await red.v()
  console.log(await db.get('id'))
  red.p(db)

  const dbs = await red.drain()
  dbs.map((db) => db.quit())
}
f().catch((e) => console.log(e)).then(() => console.log('READY'))
