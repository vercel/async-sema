declare module 'async-sema' {
  
  class Sema {
    
    constructor(nr: number,
                {initFn, pauseFn, resumeFn, capacity}: { initFn(): string, pauseFn(): void, resumeFn(): void, capacity: number } = {});
    
    drain(): Promise<string[]>;
    
    nrWaiting(): number;

    v(): Promise<string>;

    acquire(token?: string): void;
    
    p(token?: string): void;

    release(token?: string): void;
    
  }
  
  export = Sema;
}

declare module 'async-sema/rate-limit' {
  
  export default function RateLimit(rps: number): () => Promise<void>;
  
}
