import { Sema } from './Sema';

export function RateLimit(
  rps: number,
  {
    timeUnit = 1000,
    uniformDistribution = false,
  }: {
    timeUnit?: number;
    uniformDistribution?: boolean;
  } = {},
) {
  const sema = new Sema(uniformDistribution ? 1 : rps);
  const delay = uniformDistribution ? timeUnit / rps : timeUnit;

  return async function rl() {
    await sema.acquire();
    setTimeout(() => sema.release(), delay);
  };
}
