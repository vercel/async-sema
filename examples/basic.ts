import { Sema } from 'sema4';

function getRnd(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function foo() {
  const arr = [];

  for (let i = 0; i < 100; i++) arr.push(i + 1);

  const s = new Sema(13, { capacity: arr.length });

  await Promise.all(
    arr.map(async (elem) => {
      await s.acquire();

      console.log(elem, s.waiting());

      await new Promise((resolve) => setTimeout(resolve, getRnd(500, 3000)));

      s.release();
    }),
  );

  console.log('hello');
}

foo()
  .catch((e) => console.log(e))
  .then(() => console.log('READY'));
