/**
 * Thrown by `uniqueFactory`/`unique` when a unique value could not be produced: either
 * `maxRetries`/`maxTime` was exceeded while generating from a function, or a plain value passed
 * to `unique(value)` was already present in the store.
 *
 * @example
 * ```ts
 * import { unique, UniqueError } from '@dpaskhin/unique';
 *
 * try {
 *   unique(() => Math.floor(Math.random() * 2), [], { maxRetries: 5 });
 * } catch (error) {
 *   if (error instanceof UniqueError) {
 *     console.error(error.message);
 *     console.error(error.storeSize, error.iterations, error.duration);
 *   }
 * }
 * ```
 */
export class UniqueError extends Error {
  /**
   * The number of values held by the store at the time of failure.
   */
  readonly storeSize: number;

  /**
   * How long (in milliseconds) generation was attempted before giving up.
   */
  readonly duration: number;

  /**
   * How many times `fn` was called before giving up.
   */
  readonly iterations: number;

  constructor(
    message: string,
    storeSize: number,
    duration: number,
    iterations: number
  ) {
    super(
      `${message} - store size: ${storeSize}, retried: ${iterations}, duration: ${duration}ms`
    );
    this.name = 'UniqueError';
    this.storeSize = storeSize;
    this.duration = duration;
    this.iterations = iterations;
  }
}
