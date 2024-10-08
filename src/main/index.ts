/**
 * Configuration options for the unique value generation process.
 *
 * @template Fn The type of the function passed to generate values.
 *
 * @property {Set<unknown>} [store] - Optional store to keep track of unique values. If a stringifier is provided, the store is a `Set<string>`. Otherwise, it's a `Set<ReturnType<Fn>>`.
 * @property {number} [maxRetries=50] - The maximum number of retries allowed to generate a unique value before throwing an error. Defaults to 50.
 * @property {number} [maxTime=50] - The maximum time allowed (in milliseconds) for generating a unique value before throwing an error. Defaults to 50ms.
 * @property {ReturnType<Fn>[]} [exclude] - A list of values to be excluded from the result set. When a stringifier is provided, the list will be stringified.
 * @property {(value: ReturnType<Fn>) => string} [stringifier] - A function to stringify a result value before storing it in the set or checking for uniqueness. If provided, it ensures that the store and exclude list work with stringified values.
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
 * // Create a unique generator for first names
 * const createUniqueName = uniqueFactory(faker.person.firstName);
 *
 * const name1 = createUniqueName(); // Create a unique name
 * const name2 = createUniqueName(); // Create another unique name
 *
 * console.log(name1, name2); // Outputs two different names
 * ```
 *
 * @example
 * ```ts
 * import { uniqueFactory } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Create a unique generator for users using a stringifier
 * const createUser = () => ({
 *   name: faker.person.firstName(),
 *   age: faker.number.int({ min: 18, max: 100 }),
 * });
 * const createUniqueUser = uniqueFactory(createUser, {
 *   stringifier: value => JSON.stringify(value),
 * });
 *
 * const user1 = createUniqueUser();
 * const user2 = createUniqueUser();
 *
 * console.log(user1, user2); // Outputs two unique users
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
    stringifier,
  } = options;

  if (stringifier) {
    exclude = exclude.map(value => stringifier(value)) as ReturnType<Fn>[];
  }

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

      let tmpResult = stringifier ? stringifier(result) : result;

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
 * const uniqueRandomValue1 = unique(Math.random); // Uses GLOBAL_STORE
 * const uniqueRandomValue2 = unique(Math.random); // Uses GLOBAL_STORE to ensure global uniqueness
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
 * // Example with a function that takes no arguments
 * console.log(unique(faker.person.bio)); // Outputs a unique user's bio
 * ```
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 *
 * // Example with a function that takes no arguments and a custom store
 * const uniqueRandomNumber = unique(Math.random, [], {
 *   store: new Set<number>(), // Using a custom store
 *   maxRetries: 5,
 * });
 * console.log(uniqueRandomNumber); // Outputs a unique random number
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
 * const createUniqueEmail = (firstName: string, lastName: string) => {
 *   return faker.internet.email({ firstName, lastName });
 * };
 * const uniqueEmail = unique(createUniqueEmail, ['John', 'Doe'], { maxRetries: 5 });
 * console.log(uniqueEmail); // Outputs a unique random email
 * ```
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Example with a function that takes arguments and uses a stringifier
 * const createUser = (name: string, age: number) => ({ name, age });
 * const uniqueUser = unique(
 *   createUser,
 *   [faker.person.firstName(), faker.number.int({ min: 18, max: 100 })],
 *   {
 *     stringifier: value => JSON.stringify(value), // Stringify the object for uniqueness checks
 *     maxRetries: 10,
 *   }
 * );
 * console.log(uniqueUser); // Outputs a unique user
 * ```
 */
export function unique<Fn extends (...args: any[]) => any>(
  fn: Fn,
  args: Parameters<Fn>,
  options?: IOptions<Fn>
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
 * @template Fn The type of the function that generates values.
 *
 * @param {Fn} fn - The function to generate values. This function may or may not accept arguments.
 * @param {Parameters<Fn>} [args=[]] - The arguments to be passed to the function `fn`. Defaults to an empty array if no arguments are needed.
 * @param {IOptions<Fn>} [options={}] - Optional configuration for controlling the uniqueness generation process.
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
 * console.log(unique(faker.person.bio)); // Outputs a unique user's bio
 * ```
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Example with a function that takes arguments
 * const createUniqueEmail = (firstName: string, lastName: string) => {
 *   return faker.internet.email({ firstName, lastName });
 * };
 * const uniqueEmail = unique(createUniqueEmail, ['John', 'Doe'], { maxRetries: 5 });
 * console.log(uniqueEmail); // Outputs a unique random email
 * ```
 *
 * @example
 * ```ts
 * import { unique } from '@dpaskhin/unique';
 * import { faker } from '@faker-js/faker';
 *
 * // Example with a function that takes arguments and uses a stringifier
 * const createUser = (name: string, age: number) => ({ name, age });
 * const uniqueUser = unique(
 *   createUser,
 *   [faker.person.firstName(), faker.number.int({ min: 18, max: 100 })],
 *   {
 *     stringifier: value => JSON.stringify(value), // Stringify the object for uniqueness checks
 *     maxRetries: 10,
 *   }
 * );
 * console.log(uniqueUser); // Outputs a unique user
 * ```
 */
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
