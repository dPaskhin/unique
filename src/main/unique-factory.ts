import type { IOptions } from './types';
import { UniqueError } from './unique-error';
import { defaultStringifier } from './stringify';
import { EMPTY_ARRAY, EMPTY_OPTIONS } from './shared-empty';

/**
 * Creates a function that generates unique values based on the passed function `fn`.
 *
 * @template Fn The type of the function passed to generate values.
 *
 * @param {Fn} fn - The function to generate values
 * @param {IOptions<ReturnType<Fn>>} [options] - Optional configuration for controlling the uniqueness generation process.
 * @returns {(args: Parameters<Fn>) => ReturnType<Fn>} A new function that generates unique values based on `fn`.
 *
 * @throws {UniqueError} Throws if the max retries or max time is exceeded.
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
  options: IOptions<ReturnType<Fn>> = EMPTY_OPTIONS
): (...args: Parameters<Fn>) => ReturnType<Fn> {
  const {
    // Must stay a fresh Set per call — unlike the other defaults below, this one holds real
    // per-generator state, so sharing it globally would leak uniqueness across unrelated calls.
    store = new Set<unknown>(),
    maxRetries = 50,
    maxTime = 50,
    exclude = EMPTY_ARRAY,
    stringifier = defaultStringifier,
  } = options;

  // Skip building the exclude set entirely when there's nothing to exclude (the common case),
  // instead of always allocating an intermediate array + Set.
  let excludeSet: Set<string> | undefined;
  if (exclude.length > 0) {
    excludeSet = new Set<string>();
    for (const value of exclude) {
      excludeSet.add(stringifier(value));
    }
  }

  return function (...args) {
    let result: ReturnType<Fn>;
    let currentIterations = 0;
    const startTime = Date.now();

    while (true) {
      const duration = Date.now() - startTime;

      if (duration >= maxTime) {
        throw new UniqueError(
          `Exceeded maxTime (${maxTime})`,
          store.size,
          duration,
          currentIterations
        );
      }

      if (currentIterations >= maxRetries) {
        throw new UniqueError(
          `Exceeded maxTries (${maxRetries})`,
          store.size,
          duration,
          currentIterations
        );
      }

      result = fn.apply(null, args);

      const stringifiedResult = stringifier(result);

      currentIterations++;

      if (
        !store.has(stringifiedResult) &&
        !excludeSet?.has(stringifiedResult)
      ) {
        store.add(stringifiedResult);
        break;
      }
    }

    return result;
  };
}
