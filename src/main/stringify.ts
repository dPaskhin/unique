/**
 * The default stringifier used to key values in a uniqueness store.
 *
 * Unlike bare `JSON.stringify`, this distinguishes `NaN`/`Infinity`/`-Infinity` from `null` (which
 * `JSON.stringify` otherwise collapses to the same `"null"` string) and always returns a real string,
 * even for values like `undefined` for which `JSON.stringify` returns `undefined` itself.
 */
export function defaultStringifier(value: unknown): string {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return String(value); // 'NaN' | 'Infinity' | '-Infinity'
  }

  const stringified = JSON.stringify(value);

  return typeof stringified === 'string' ? stringified : String(value);
}
