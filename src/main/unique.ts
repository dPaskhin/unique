import type { IOptions, UniqueOverloads } from './types';
import { uniqueFactory } from './unique-factory';
import { normalizeUniqueCall } from './normalize-call';

function uniqueImpl(
  fnOrValue: unknown,
  argsOrOptions?: unknown,
  options?: IOptions<any>
): unknown {
  const normalized = normalizeUniqueCall(fnOrValue, argsOrOptions, options);

  return uniqueFactory(normalized.fn, normalized.options).apply(
    null,
    normalized.args
  );
}

export const unique = uniqueImpl as UniqueOverloads;
