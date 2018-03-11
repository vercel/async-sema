const Sema = require('./index')

module.exports = function rateLimit(rps) {
  const sema = new Sema(rps);

  return async function rl() {
    await sema.acquire();
    setTimeout(() => sema.release(), 1000);
  }
}
