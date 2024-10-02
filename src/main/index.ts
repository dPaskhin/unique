interface IOptions<Result> {
  store?: Set<Result>;
  maxRetries?: number;
  maxTime?: number;
  exclude?: Result[];
}

function createErrorMessage(
  code: string,
  storeSize: number,
  duration: number,
  currentIterations: number
): string {
  return `
  ${code} for uniqueness check.
    
Found ${storeSize} unique entries before throwing error.
retried: ${currentIterations}
total time: ${duration}ms

May not be able to generate any more unique values with current settings.
Try adjusting maxTime or maxRetries parameters.`;
}

export function uniqueFactory<Args, Result>(
  fn: (...args: Args[]) => Result,
  options: IOptions<Result> = {}
): (...args: Args[]) => Result {
  const {
    store = new Set<Result>(),
    maxRetries = 50,
    maxTime = 50,
    exclude = [],
  } = options;

  return function (...args) {
    let result: Result;
    let currentIterations = 0;
    let startTime = Date.now();

    while (true) {
      let now = Date.now();
      let duration = now - startTime;

      if (now - startTime >= maxTime) {
        throw new Error(
          createErrorMessage(
            'Exceeded maxTime: ' + maxTime,
            store.size,
            duration,
            currentIterations
          )
        );
      }

      if (currentIterations >= maxRetries) {
        throw new Error(
          createErrorMessage(
            'Exceeded maxTries: ' + maxRetries,
            store.size,
            duration,
            currentIterations
          )
        );
      }

      result = fn.apply(null, args);
      currentIterations++;

      if (!store.has(result) && !exclude.includes(result)) {
        store.add(result);
        break;
      }
    }

    return result;
  };
}

const GLOBAL_STORE = new Set();

export function unique<Args, Result>(
  fn: (...args: Args[]) => Result,
  args: Args[] = [],
  options: IOptions<Result> = {}
): Result {
  return uniqueFactory<Args, Result>(
    fn,
    Object.assign(options, { store: options.store || GLOBAL_STORE })
  ).apply(null, args);
}
