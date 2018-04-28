const Sema = require('./index')

module.exports = function rateLimit(rps, { timeUnit = 1000, equalDistribution = false } = {}) {
  const sema = new Sema(equalDistribution ? 1 : rps);
  const delay = equalDistribution ? timeUnit / rps : timeUnit;

  return async function rl() {
    await sema.acquire();
    setTimeout(() => sema.release(), delay);
  }
}
