import { Sema } from './Sema';

export function createRateLimiter(
  rptu: number,
  {
    timeUnit = 1000,
    uniformDistribution = false,
  }: {
    timeUnit?: number;
    uniformDistribution?: boolean;
  } = {},
): () => Promise<void> {
  const sema = new Sema(uniformDistribution ? 1 : rptu);
  const delay = uniformDistribution ? timeUnit / rptu : timeUnit;

  return async function limiter() {
    await sema.acquire();
    setTimeout(() => sema.release(), delay);
  };
}
