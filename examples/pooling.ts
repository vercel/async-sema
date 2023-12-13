import { Sema } from 'sema4';
import { createClient } from 'redis';

async function f() {
  const red = new Sema(3, {
    initFn: () => createClient(process.env.REDIS_URL).connect(),
  });

  const db = await red.acquire();

  console.log(await db.get('id'));

  red.release(db);

  const dbs = await red.drain();

  dbs.map((db) => db.quit());
}

f()
  .catch((e) => console.log(e))
  .then(() => console.log('READY'));
