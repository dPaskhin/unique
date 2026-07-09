/**
 * A global store to track unique values across the application.
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
export const GLOBAL_STORE = new Set<unknown>();
