# @dpaskhin/unique

[![npm version](https://img.shields.io/npm/v/@dpaskhin/unique.svg)](https://www.npmjs.com/package/@dpaskhin/unique)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@dpaskhin/unique)](https://bundlephobia.com/package/@dpaskhin/unique)
[![license](https://img.shields.io/npm/l/@dpaskhin/unique.svg)](https://github.com/dPaskhin/unique/blob/main/LICENSE)

**@dpaskhin/unique** is a TypeScript library for generating unique values. It ensures no duplicates by rejecting repeats
and retrying until a new result is found. Ideal for ensuring non-repeated random values.

## Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [License](#license)
- [Contributing](#contributing)

## Installation

To install **@dpaskhin/unique**, run:

```shell
npm install --save-dev @dpaskhin/unique
```

Or, if you use pnpm:

```shell
pnpm add --save-dev @dpaskhin/unique
```

## Features

- Generate unique values based on the output of any function or plain value.
- Supports `custom` stores or `global` storage for uniqueness tracking.
- Configurable `retry` and `timeout` options.
- `stringifier` support for custom handling of complex objects during uniqueness checks.

## Usage

#### Basic Example

Here’s a quick example using **@dpaskhin/unique**:

```ts
import { unique } from '@dpaskhin/unique';

// Outputs a unique random number each time
console.log(unique(Math.random));
console.log(unique(Math.random));
console.log(unique(Math.random));
```

#### Example with Faker.js

**@dpaskhin/unique** works well with libraries like [Faker.js](https://github.com/faker-js/faker) for generating unique
random data.

```ts
import { unique, uniqueFactory } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';

// Outputs a unique first name each time
console.log(unique(faker.person.firstName));
console.log(unique(faker.person.firstName));
console.log(unique(faker.person.firstName));

// ----------------------------------------

const createUniqueUser = uniqueFactory(() => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  age: faker.number.int({ min: 18, max: 100 }),
}));

// Each output user is structurally unique
console.log(createUniqueUser());
console.log(createUniqueUser());
console.log(createUniqueUser());
```

#### Custom Store

You can provide your own store to isolate uniqueness checks. This ensures that uniqueness is tracked within the scope of
your application.

```ts
import { unique } from '@dpaskhin/unique';

const scopedStore = new Set();

// Outputs a unique random number
console.log(unique(Math.random, [], { store: scopedStore }));
```

#### Global Store

If you don’t provide a custom store, the library will use the **GLOBAL_STORE** by default. This can be useful if you
want to track unique values across different parts of your application.

```ts
import { unique, GLOBAL_STORE } from '@dpaskhin/unique';

// Use the global store for uniqueness checks
const uniqueRandomValue1 = unique(Math.random);
const uniqueRandomValue2 = unique(Math.random);

// Outputs two unique random values
console.log(uniqueRandomValue1, uniqueRandomValue2);

// Clear the global store when needed
GLOBAL_STORE.clear();
```

#### Excluding Specific Values

You can also provide an exclude list to prevent specific values from being considered during uniqueness checks.

```ts
import { uniqueFactory } from '@dpaskhin/unique';

const createUniqueRandom = uniqueFactory(Math.random, {
  // Prevents these values from being returned
  exclude: [0.5, 0.6],
});

// Outputs a unique random number, excluding 0.5 and 0.6
console.log(createUniqueRandom());
```

#### Stringifier for Complex Objects or other non-primitive types

The **stringifier** option allows you to handle complex objects by converting them into strings for uniqueness checks.

_By default, a `JSON.stringify`-based stringifier is used — it additionally distinguishes `NaN`/`Infinity`/`-Infinity`
from `null` (which bare `JSON.stringify` otherwise collapses to the same `"null"` key) and always returns a real
string, even for values like `undefined` for which `JSON.stringify` itself returns `undefined`._

```ts
import { uniqueFactory } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';
import JsonMarshal from 'json-marshal';

const createUniqueUser = uniqueFactory(
  () => ({
    name: faker.person.firstName(),
    age: faker.number.int({ min: 18, max: 100 }),
  }),
  {
    // Here can be any function that takes the return value of the function provided above and converts it to a string.
    // Or just omit it to use the default stringifier described above.
    stringifier: JsonMarshal.stringify,
  }
);

const user1 = createUniqueUser();
const user2 = createUniqueUser();

// Outputs two unique users
console.log(user1, user2);
```

## API Reference

### uniqueFactory(fn, options)

Creates a function that ensures unique results based on the provided function fn.

#### Parameters

- fn - The function used to generate values.
- options - Optional. An object containing configuration options:
  - **store** (Set): A custom store to track unique values. Defaults to a **new Set**.
  - **maxRetries** (number): The maximum number of retries to generate a unique value before throwing an error.
    Defaults to 50.
  - **maxTime** (number): The maximum time (in milliseconds) to attempt generating a unique value before throwing an
    error. Defaults to 50ms.
  - **exclude** (Array): A list of values to exclude from the result set. These values will not be
    returned by the unique generator.
  - **stringifier** (function): A function to stringify a result before storing it. Defaults to a `JSON.stringify`-based
    stringifier (see [Stringifier for Complex Objects](#stringifier-for-complex-objects-or-other-non-primitive-types)).

#### Returns

A function that generates unique values based on fn with the same signature.

#### Example

```ts
import { uniqueFactory } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';

const createUniqueUser = uniqueFactory(() => ({
  name: faker.person.firstName(),
  age: faker.number.int({ min: 18, max: 100 }),
}));

// Outputs a unique user each time
console.log(createUniqueUser());
console.log(createUniqueUser());
console.log(createUniqueUser());
```

### unique(fn, args, options)

Generates a unique value by running fn and ensuring uniqueness via either a provided or global store.

#### Parameters

- fn - The function used to generate values.
- args - Optional. An array of arguments to be passed to fn.
- options - Optional. An object containing configuration options:
  - **store** (Set): A custom store to track unique values. By default, the **GLOBAL_STORE** is used.
  - **maxRetries** (number): The maximum number of retries to generate a unique value before throwing an error.
    Defaults to 50.
  - **maxTime** (number): The maximum time (in milliseconds) to attempt generating a unique value before throwing an
    error. Defaults to 50ms.
  - **exclude** (Array): A list of values to exclude from the result set. These values will not be
    returned by the unique generator.
  - **stringifier** (function): A function to stringify a result before storing it. Defaults to a `JSON.stringify`-based
    stringifier (see [Stringifier for Complex Objects](#stringifier-for-complex-objects-or-other-non-primitive-types)).

#### Returns

A unique value generated by fn.

#### Example

```ts
import { unique } from '@dpaskhin/unique';
import { faker } from '@faker-js/faker';

const uniqueEmail = unique(faker.internet.email, [
  {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  },
]);

// Outputs a unique email
console.log(uniqueEmail);
```

### unique(value, options)

Ensures a plain value is unique by checking against either a provided or global store.

#### Parameters

- value - The plain value (non-functional) to ensure uniqueness for.
- options - Optional. An object containing configuration options:
  - **store** (Set): A custom store to track unique values. By default, the **GLOBAL_STORE** is used.
  - **exclude** (Array): A list of values to exclude. These values will not be added to the store or returned.
  - **stringifier** (function): A function to stringify the value before storing it. Defaults to a `JSON.stringify`-based
    stringifier (see [Stringifier for Complex Objects](#stringifier-for-complex-objects-or-other-non-primitive-types)).

#### Returns

The unique value provided.

#### Example

This overload is for checking a value you already have — not a randomly generated one — against a store, e.g. a slug
derived from user input:

```ts
import { unique } from '@dpaskhin/unique';

const usedSlugs = new Set();

function toSlug(title: string) {
  return unique(title.toLowerCase().replace(/\s+/g, '-'), { store: usedSlugs });
}

console.log(toSlug('Hello World')); // 'hello-world'
toSlug('Hello World'); // throws UniqueError — slug already taken
```

### UniqueError

The error class thrown by `uniqueFactory`/`unique` when a unique value could not be produced. Extends `Error`.

#### Fields

- **storeSize** (number): The number of values held by the store at the time of failure.
- **duration** (number): How long (in milliseconds) generation was attempted before giving up.
- **iterations** (number): How many times the generator function was called before giving up.

See [Error Handling](#error-handling) below for a usage example.

### GLOBAL_STORE

The module-level `Set` used by `unique()` calls that don't provide a custom `store` option. Shared across your entire
application by default — see [Global Store](#global-store) above, and [Best Practices](#best-practices) for when to
avoid it.

## Error Handling

`uniqueFactory`/`unique` throw a `UniqueError` when they can't produce a unique value:

- For function-based generation (`uniqueFactory(fn)`, `unique(fn, args)`), this happens once `maxRetries` or `maxTime`
  is exceeded.
- For the plain-value form (`unique(value)`), this happens immediately if `value` is already in the store.

`UniqueError` is exported, so you can check for it specifically instead of parsing the error message:

```ts
import { unique, UniqueError } from '@dpaskhin/unique';

try {
  unique(() => Math.floor(Math.random() * 2), [], { maxRetries: 5 });
} catch (error) {
  if (error instanceof UniqueError) {
    console.error(error.message);
    console.error(error.storeSize, error.iterations, error.duration);
  }
}
```

## Best Practices

- Avoid using the global store when local uniqueness is required, as it may lead to unexpected results
  due to shared state.
- Configure Max Retries and Timeouts: Customize maxRetries and maxTime based on the expected uniqueness and complexity
  of generated values.
- Avoid using plain values and prefer generating functions for flexibility and retries.

## License

**@dpaskhin/unique** is licensed under the MIT License.

## Contributing

Contributions are welcome! If you have ideas or improvements, feel free to submit a pull request.
