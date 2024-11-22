import { expectType } from 'tsd';
import { GLOBAL_STORE, unique, uniqueFactory } from '../../main';

const value: string = '';

// @ts-expect-error
function withArgs(foo: string, bar: number): number {
  return 1;
}

function withoutArgs(): string {
  return 'foo';
}

// Plain value
// ----------------------------------------

expectType<'foo'>(unique('foo'));

expectType<1>(unique(1));

// Infers valid return type.
// @ts-expect-error
expectType<number>(unique('foo'));

// Must be provided at least one param.
// @ts-expect-error
unique();

// Does not accept an array as second param (empty).
// @ts-expect-error
unique('foo', []);

// Does not accept an array as second param (with value).
// @ts-expect-error
unique('foo', ['1']);

// Does not accept maxRetries option.
// @ts-expect-error
unique('foo', { maxRetries: 51 });

// Does not accept maxTime option.
// @ts-expect-error
unique('foo', { maxTime: 51 });

expectType<number>(unique(withArgs('foo', 1)));

// Infers valid return type.
// @ts-expect-error
expectType<string>(unique(withArgs('foo', 1)));

expectType<string>(unique(withoutArgs()));

// Infers valid return type.
// @ts-expect-error
expectType<number>(unique(withoutArgs()));

expectType<string>(unique(value));

expectType<'foo'>(unique('foo', { store: GLOBAL_STORE }));

expectType<1>(unique(1, { store: GLOBAL_STORE }));

expectType<string>(unique(value, { store: GLOBAL_STORE }));

// Exclude has to be the same as the return type.
// @ts-expect-error
unique(() => 1, [], { exclude: ['1'] });

// Functions
// ----------------------------------------

expectType<string>(unique(withoutArgs));

// Infers valid return type.
// @ts-expect-error
expectType<number>(unique(withoutArgs));

// Does not accept any params through the params array.
// @ts-expect-error
unique(withoutArgs, ['1']);

// Does not accept options as second param.
// @ts-expect-error
unique(withoutArgs, { store: GLOBAL_STORE });

expectType<string>(unique(withoutArgs, [], { store: GLOBAL_STORE }));

expectType<number>(unique(withArgs, ['foo', 1]));

// Infers valid return type.
// @ts-expect-error
expectType<string>(unique(withArgs, ['foo', 1]));

expectType<number>(unique(withArgs, ['foo', 1], { store: GLOBAL_STORE }));

// Params must be provided.
// @ts-expect-error
unique(withArgs);

// Does not accept options as second param.
// @ts-expect-error
unique(withArgs, { store: GLOBAL_STORE });

// Global store
// ----------------------------------------
expectType<Set<unknown>>(GLOBAL_STORE);

// Factory
// ----------------------------------------

expectType<(foo: string, bar: number) => number>(uniqueFactory(withArgs));

expectType<() => string>(uniqueFactory(withoutArgs));

expectType<() => string>(uniqueFactory(withoutArgs, { store: GLOBAL_STORE }));

expectType<() => void>(uniqueFactory(() => {}));

// Exclude has to be the same as the return type.
// @ts-expect-error
uniqueFactory(() => {}, { exclude: ['1'] });

// Must be provided at least one param.
// @ts-expect-error
uniqueFactory();
