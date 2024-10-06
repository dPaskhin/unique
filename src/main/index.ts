/**
 * Configuration options for the unique generation process.
 *
 * @template Result The type of the result generated by the function.
 *
 * @property {Set<Result>} [store] - Optional store to keep track of unique values. Defaults to a new Set.
 * @property {number} [maxRetries=50] - The maximum number of retries to generate a unique value. Defaults to 50.
 * @property {number} [maxTime=50] - The maximum time (in ms) allowed for generating a unique value before throwing an error. Defaults to 50ms.
 * @property {unknown[]} [exclude] - List of values that should be excluded from the result set.
 */
interface IOptions<Result> {
  store?: Set<Result>;
  maxRetries?: number;
  maxTime?: number;
  exclude?: unknown[];
}

/**
 * Creates a function that generates unique values based on a passed function `fn`.
 * Ensures uniqueness by storing generated values and retrying if duplicates are found.
 *
 * @template Fn The type of the function passed to generate values.
 *
 * @param {Fn} fn - The function to generate values.
 * @param {IOptions<ReturnType<Fn>>} [options={}] - Optional configuration for controlling the uniqueness generation process.
 * @returns {(args: Parameters<Fn>) => ReturnType<Fn>} A new function that generates unique values based on `fn`.
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
export function uniqueFactory<Fn extends (...args: any[]) => any>(
  fn: Fn,
  options: IOptions<ReturnType<Fn>> = {}
): (...args: Parameters<Fn>) => ReturnType<Fn> {
  const {
    store = new Set<ReturnType<Fn>>(),
    maxRetries = 50,
    maxTime = 50,
    exclude = [],
  } = options;

  return function (...args) {
    let result: ReturnType<Fn>;
    let currentIterations = 0;
    let startTime = Date.now();

    while (true) {
      let now = Date.now();
      let duration = now - startTime;

      if (duration >= maxTime) {
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
 *
 * **Example:**
 *
 * @example
 * ```ts
 * const randomValueGen = () => Math.random();
 *
 * const uniqueRandomValue1 = unique(randomValueGen); // Uses GLOBAL_STORE
 * const uniqueRandomValue2 = unique(randomValueGen); // Uses GLOBAL_STORE to ensure global uniqueness
 *
 * console.log(uniqueRandomValue1, uniqueRandomValue2); // Outputs two unique values
 *
 * // Clear the global store when needed
 * GLOBAL_STORE.clear();
 * ```
 */
export const GLOBAL_STORE = new Set();

/**
 * Generates a unique value using the provided function `fn` that takes no arguments.
 * It ensures uniqueness by checking against previous results stored either in the provided `store` or the global store.
 *
 * **Note:** The global store is shared across multiple invocations, and values will persist globally.
 * If you need isolation between different parts of your application, you should provide a custom `store` in the options.
 *
 * **Best Practice:** Avoid using the global store in environments where global uniqueness is not needed,
 * as it may lead to unexpected results due to shared state.
 *
 * @template Fn The type of the function that generates values without arguments.
 *
 * @param {Fn} fn - The function to generate values. This function must not accept any arguments.
 * @param {never[]} [args] - No arguments should be passed for functions that don't accept arguments. This is automatically inferred.
 * @param {IOptions<ReturnType<Fn>>} [options] - Optional configuration for controlling the uniqueness generation process. Defaults to using the global store if no store is provided.
 * @returns {ReturnType<Fn>} The unique value generated by the function `fn`.
 *
 * @throws {Error} Throws an error if the max retries or max time is exceeded.
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Example with a function that takes no arguments
 * const uniqueFirstName = unique(faker.person.firstName);
 * console.log(uniqueFirstName); // Outputs a unique first name
 * ```
 */
export function unique<Fn extends () => any>(
  fn: Fn,
  args?: never[],
  options?: IOptions<ReturnType<Fn>>
): ReturnType<Fn>;

/**
 * Generates a unique value using the provided function `fn` that accepts arguments.
 * It ensures uniqueness by checking against previous results stored either in the provided `store` or the global store.
 *
 * **Note:** The global store is shared across multiple invocations, and values will persist globally.
 * If you need isolation between different parts of your application, you should provide a custom `store` in the options.
 *
 * **Best Practice:** Avoid using the global store in environments where global uniqueness is not needed,
 * as it may lead to unexpected results due to shared state.
 *
 * @template Fn The type of the function that generates values and accepts arguments.
 *
 * @param {Fn} fn - The function to generate values. This function must accept arguments.
 * @param {Parameters<Fn>} args - The arguments to be passed to the function `fn`.
 * @param {IOptions<ReturnType<Fn>>} [options] - Optional configuration for controlling the uniqueness generation process. Defaults to using the global store if no store is provided.
 * @returns {ReturnType<Fn>} The unique value generated by the function `fn`.
 *
 * @throws {Error} Throws an error if the max retries or max time is exceeded.
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Example with a function that takes arguments
 * const uniqueEmailGen = (firstName: string, lastName: string) => {
 *   return faker.internet.email({ firstName, lastName });
 * };
 * const uniqueEmail = unique(uniqueEmailGen, ['John', 'Doe'], { maxRetries: 5 });
 * console.log(uniqueEmail); // Outputs a unique random email
 * ```
 */
export function unique<Fn extends (...args: any[]) => any>(
  fn: Fn,
  args: Parameters<Fn>,
  options?: IOptions<ReturnType<Fn>>
): ReturnType<Fn>;

/**
 * Generates a unique value using the provided function `fn`, ensuring uniqueness based on previous results stored in a custom store or the global store.
 * The function `fn` can either take arguments or not, and the default value for `args` will be an empty array if not provided.
 *
 * **Note:** The global store is shared across multiple invocations, and values will persist globally.
 * If you need isolation between different parts of your application, you should provide a custom `store` in the options.
 *
 * **Best Practice:** Avoid using the global store in environments where global uniqueness is not needed,
 * as it may lead to unexpected results due to shared state.
 *
 * @template Fn The type of the function passed to generate values.
 *
 * @param {Fn} fn - The function to generate values. This function can accept arguments or not.
 * @param {Parameters<Fn>} [args=[]] - The arguments to be passed to the function `fn`. Defaults to an empty array if no arguments are needed.
 * @param {IOptions<ReturnType<Fn>>} [options={}] - Optional configuration for controlling the uniqueness generation process. Includes a custom store, maxRetries, maxTime, and an exclusion list.
 *
 * @returns {ReturnType<Fn>} The unique value generated by the function `fn`.
 *
 * @throws {Error} Throws an error if the max retries or max time is exceeded.
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Example with a function that takes no arguments
 * const uniqueFirstName = unique(faker.person.firstName);
 * console.log(uniqueFirstName); // Outputs a unique first name
 * ```
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Example with a function that takes arguments
 * const uniqueEmailGen = (firstName: string, lastName: string) => {
 *   return faker.internet.email({ firstName, lastName });
 * };
 * const uniqueEmail = unique(uniqueEmailGen, ['John', 'Doe'], { maxRetries: 5 });
 * console.log(uniqueEmail); // Outputs a unique random email
 * ```
 */
export function unique<Fn extends (...args: any[]) => any>(
  fn: Fn,
  args: Parameters<Fn> = [] as unknown as Parameters<Fn>,
  options: IOptions<ReturnType<Fn>> = {}
): ReturnType<Fn> {
  return uniqueFactory(
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
