/**
 * Configuration options for the unique value generation process.
 *
 * @template Fn The type of the function passed to generate values.
 *
 * @property {Set<unknown>} [store] - Optional store to keep track of unique values. If a stringifier is provided, the store is a `Set<string>`. Otherwise, it's a `Set<ReturnType<Fn>>`.
 * @property {number} [maxRetries=50] - The maximum number of retries allowed to generate a unique value before throwing an error. Defaults to 50.
 * @property {number} [maxTime=50] - The maximum time allowed (in milliseconds) for generating a unique value before throwing an error. Defaults to 50ms.
 * @property {ReturnType<Fn>[]} [exclude] - A list of values to be excluded from the result set. When a stringifier is provided, the list will be stringified.
 * @property {(value: ReturnType<Fn>) => string} [stringifier] - A function to stringify a result value before storing it in the set and checking for uniqueness. Defaults to {@link JSON.stringify}.
 */
type IOptions<Fn extends (...args: any) => any> = {
  store?: Set<unknown>;
  maxRetries?: number;
  maxTime?: number;
  exclude?: ReturnType<Fn>[];
  stringifier?: (value: ReturnType<Fn>) => string;
};

/**
 * Creates a function that generates unique values based on the passed function `fn`.
 * Ensures uniqueness by storing generated values and retrying if duplicates are found.
 *
 * @template Fn The type of the function passed to generate values.
 *
 * @param {Fn} fn - The function to generate values
 * @param {IOptions<Fn>} [options={}] - Optional configuration for controlling the uniqueness generation process.
 * @returns {(args: Parameters<Fn>) => ReturnType<Fn>} A new function that generates unique values based on `fn`.
 *
 * @throws {Error} Throws an error if the max retries or max time is exceeded.
 *
 * @example
 * ```ts
 * import { uniqueFactory } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Example of generating unique user objects
 * const createUniqueUser = uniqueFactory(() => ({
 *   firstName: faker.person.firstName(),
 *   lastName: faker.person.lastName(),
 *   age: faker.number.int({ min: 18, max: 100 }),
 * }));
 *
 * // Outputs a structurally unique user
 * console.log(createUniqueUser());
 * ```
 */
export function uniqueFactory<Fn extends (...args: any[]) => any>(
  fn: Fn,
  options: IOptions<Fn> = {}
): (...args: Parameters<Fn>) => ReturnType<Fn> {
  let {
    store = new Set(),
    maxRetries = 50,
    maxTime = 50,
    exclude = [],
    stringifier = JSON.stringify,
  } = options;

  exclude = exclude.map(value => stringifier(value)) as ReturnType<Fn>[];

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

      let tmpResult = stringifier(result);

      currentIterations++;

      if (
        !store.has(tmpResult) &&
        !exclude.includes(tmpResult as ReturnType<Fn>)
      ) {
        store.add(tmpResult);
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
 * @example
 * ```ts
 * import { GLOBAL_STORE, unique } from '@dpaskhin/unique';
 *
 * // Uses GLOBAL_STORE
 * const uniqueRandomValue1 = unique(Math.random);
 * // Uses GLOBAL_STORE
 * const uniqueRandomValue2 = unique(Math.random);
 *
 * // Outputs two unique values
 * console.log(uniqueRandomValue1, uniqueRandomValue2);
 *
 * // Clear the global store when needed
 * GLOBAL_STORE.clear();
 * ```
 */
export const GLOBAL_STORE = new Set();

/**
 * Generates a unique value using the provided function `fn` that takes no arguments.
 * Ensures uniqueness by checking against previous results stored either in the provided `store` or the global store.
 *
 * **Note:** The global store is shared across multiple invocations, and values will persist globally.
 * If you need isolation between different parts of your application, you should provide a custom `store` in the options.
 *
 * **Best Practice:** Avoid using the global store in environments where global uniqueness is not needed,
 * as it may lead to unexpected results due to shared state.
 *
 * @template Fn The type of the function that generates values without arguments.
 *
 * @param {Fn} fn - The function to generate values. This function does not accept any arguments.
 * @param {never[]} [args] - No arguments are passed to functions that do not accept arguments.
 * @param {IOptions<Fn>} [options] - Optional configuration for controlling the uniqueness generation process.
 * @returns {ReturnType<Fn>} The unique value generated by the function `fn`.
 *
 * @throws {Error} Throws an error if the max retries or max time is exceeded.
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Outputs a unique user's email
 * console.log(unique(faker.internet.email));
 * ```
 */
export function unique<Fn extends () => any>(
  fn: Fn,
  args?: never[],
  options?: IOptions<Fn>
): ReturnType<Fn>;

/**
 * Generates a unique value using the provided function `fn` that accepts arguments.
 * Ensures uniqueness by checking against previous results stored either in the provided `store` or the global store.
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
 * @param {IOptions<Fn>} [options] - Optional configuration for controlling the uniqueness generation process.
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
 * const uniqueEmail = unique(
 *   faker.internet.email,
 *   [{ firstName: faker.person.firstName(), lastName: faker.person.lastName() }],
 *   { maxRetries: 10 }
 * );
 *
 * // Outputs a unique user's email
 * console.log(uniqueEmail);
 * ```
 */
export function unique<Fn extends (...args: any[]) => any>(
  fn: Fn,
  args: Parameters<Fn>,
  options?: IOptions<Fn>
): ReturnType<Fn>;

export function unique<Fn extends (...args: any[]) => any>(
  fn: Fn,
  args: Parameters<Fn> = [] as unknown as Parameters<Fn>,
  options: IOptions<Fn> = {}
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
