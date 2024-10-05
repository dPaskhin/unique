/**
 * Configuration options for the unique generation process.
 *
 * @template Result The type of the result generated by the function.
 *
 * @property {Set<Result>} [store] - Optional store to keep track of unique values. Defaults to a new Set.
 * @property {number} [maxRetries=50] - The maximum number of retries to generate a unique value. Defaults to 50.
 * @property {number} [maxTime=50] - The maximum time (in ms) allowed for generating a unique value before throwing an error. Defaults to 50ms.
 * @property {Result[]} [exclude] - List of values that should be excluded from the result set.
 */
interface IOptions<Result> {
  store?: Set<Result>;
  maxRetries?: number;
  maxTime?: number;
  exclude?: Result[];
}

/**
 * Creates a function that generates unique values based on a passed function `fn`.
 * Ensures uniqueness by storing generated values and retrying if duplicates are found.
 *
 * @template Args The type of the arguments that the function takes.
 * @template Result The type of the result generated by the function.
 *
 * @param {(...args: Args[]) => Result} fn - The function to generate values.
 * @param {IOptions<Result>} [options={}] - Optional configuration for controlling the uniqueness generation process.
 * @returns {(...args: Args[]) => Result} A new function that generates unique values based on `fn`.
 *
 * @throws {Error} Throws an error if the max retries or max time is exceeded.
 *
 * @example
 * ```ts
 * import { uniqueFactory } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Create a unique generator
 * const uniqueNameGen = uniqueFactory(faker.person.firstName);
 *
 * const name1 = uniqueNameGen(); // Generate a unique name
 * const name2 = uniqueNameGen(); // Generate another unique name
 *
 * console.log(name1, name2); // Two different names
 * ```
 */
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

/**
 * A global store to track unique values across multiple invocations of the `unique` function.
 * This can be shared across different parts of the code to ensure unique values globally.
 */
export const GLOBAL_STORE = new Set();

/**
 * Generates a unique value using the provided function `fn`. It ensures uniqueness by checking
 * against previous results and values stored either in the provided `store` or the global store.
 *
 * **Note:** The global store is shared across multiple invocations, and values will persist globally.
 * If you need isolation between different parts of your application, you should provide a custom `store` in the options.
 *
 * **Best Practice:** Avoid using the global store in environments where global uniqueness is not needed,
 * as it may lead to unexpected results due to shared state.
 *
 * @template Args The type of the arguments that the function takes.
 * @template Result The type of the result generated by the function.
 *
 * @param {(...args: Args[]) => Result} fn - The function to generate values.
 * @param {Args[]} [args=[]] - The arguments to be passed to `fn`.
 * @param {IOptions<Result>} [options={}] - Optional configuration for controlling the uniqueness generation process.
 * When no `store` is provided, the function will default to using the global store.
 * @returns {Result} The unique value generated by the function `fn`.
 *
 * @throws {Error} Throws an error if the max retries or max time is exceeded.
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * const phone1 = unique(faker.phone.number); // Generate a unique phone number
 * const phone2 = unique(faker.phone.number); // Generate another unique phone number
 *
 * console.log(phone1, phone2); // Two different phone numbers
 * ```
 */
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
