import type { IOptions } from './types';
import { GLOBAL_STORE } from './global-store';
import { EMPTY_ARRAY, EMPTY_OPTIONS } from './shared-empty';

type AnyFn = (...args: any[]) => any;

interface NormalizedUniqueCall {
  fn: AnyFn;
  args: unknown[];
  options: IOptions<any>;
}

/**
 * Normalizes the three call shapes `unique` accepts (no-arg function, function + args, or a plain value)
 * into a single shape that can be handed to `uniqueFactory` without any further branching.
 */
export function normalizeUniqueCall(
  fnOrValue: unknown,
  argsOrOptions: unknown,
  options: IOptions<any> | undefined
): NormalizedUniqueCall {
  if (typeof fnOrValue === 'function') {
    const fnOptions = options ?? EMPTY_OPTIONS;

    return {
      fn: fnOrValue as AnyFn,
      args: (argsOrOptions as unknown[] | undefined) ?? EMPTY_ARRAY,
      // Reuse fnOptions as-is when it already has a store — avoids an allocation on the common
      // "I passed my own store" path. Only build a new object when GLOBAL_STORE needs adding.
      options: fnOptions.store
        ? fnOptions
        : Object.assign({}, fnOptions, { store: GLOBAL_STORE }),
    };
  }

  const valueOptions =
    (argsOrOptions as IOptions<any> | undefined) ?? EMPTY_OPTIONS;

  // maxRetries always needs forcing to 1 here, so a copy is unavoidable in this branch.
  return {
    fn: () => fnOrValue,
    args: EMPTY_ARRAY,
    options: Object.assign({}, valueOptions, {
      store: valueOptions.store ?? GLOBAL_STORE,
      maxRetries: 1,
    }),
  };
}
