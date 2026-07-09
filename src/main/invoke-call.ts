import type { IOptions } from './types';
import { GLOBAL_STORE } from './global-store';
import { EMPTY_ARRAY, EMPTY_OPTIONS } from './shared-empty';
import { uniqueFactory } from './unique-factory';

type AnyFn = (...args: any[]) => any;

/**
 * Handles the three call shapes `unique` accepts (no-arg function, function + args, or a plain
 * value) by dispatching straight to `uniqueFactory`.
 */
export function invokeUniqueCall(
  fnOrValue: unknown,
  argsOrOptions: unknown,
  options: IOptions<any> | undefined
): unknown {
  if (typeof fnOrValue === 'function') {
    const fnOptions = options ?? EMPTY_OPTIONS;

    return uniqueFactory(
      fnOrValue as AnyFn,
      // Reuse fnOptions as-is when it already has a store — avoids an allocation on the common
      // "I passed my own store" path. Only build a new object when GLOBAL_STORE needs adding.
      fnOptions.store
        ? fnOptions
        : Object.assign({}, fnOptions, { store: GLOBAL_STORE })
    ).apply(null, (argsOrOptions as any) ?? EMPTY_ARRAY);
  }

  const valueOptions =
    (argsOrOptions as IOptions<any> | undefined) ?? EMPTY_OPTIONS;

  // maxRetries always needs forcing to 1 here, so a copy is unavoidable in this branch.
  return uniqueFactory(
    () => fnOrValue,
    Object.assign({}, valueOptions, {
      store: valueOptions.store ?? GLOBAL_STORE,
      maxRetries: 1,
    })
  )();
}
